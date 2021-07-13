import { CharacterUtils, ObjectTyped, SerializableState } from '@timeflies/common';
import { createCycleEngine as _createCycleEngine, CycleEngine } from '@timeflies/cycle-engine';
import { logger } from '@timeflies/devtools';
import { BattleTurnStartMessage } from '@timeflies/socket-messages';
import { Battle } from '../battle';
import { BattleAbstractService } from '../battle-abstract-service';

export type PartialCycleBattle = Pick<Battle, 'battleId' | 'playerIdList' | 'cycleInfos' | 'stateStack' | 'currentTurnInfos' | 'cycleRunning'>;

export class CycleBattleService extends BattleAbstractService {
    afterSocketConnect = () => { };

    createCycleEngine = (battle: PartialCycleBattle, createEngine = _createCycleEngine) => {
        const { battleId, cycleInfos } = battle;

        const cycleEngine = createEngine({
            charactersList:cycleInfos.turnsOrder,
            charactersDurations: this.getCurrentState(battle).characters.actionTime,
            listeners: {
                turnStart: ({ currentTurn }) => {
                    battle.currentTurnInfos = currentTurn;

                    logger.info('Battle [' + battleId + '] -', 'Cycle turn start', currentTurn);
                },
                turnEnd: async ({ currentTurn }) => {
                    logger.info('Battle [' + battleId + '] -', 'Cycle turn end', currentTurn);

                    await this.services.playerBattleService.checkLeavedAndDisconnectedPlayers(battleId);

                    if (battle.cycleRunning) {
                        this.beforeTurnStart(battle, cycleEngine);
                        return cycleEngine.startNextTurn();
                    }
                }
            }
        });
        return cycleEngine;
    };

    private beforeTurnStart = ({ playerIdList }: Pick<Battle, 'playerIdList'>, cycleEngine: CycleEngine) => {
        const { roundIndex, turnIndex, characterId, startTime } = cycleEngine.getNextTurnInfos();

        playerIdList.forEach(playerId => {

            const socketCell = this.playerSocketMap[ playerId ];

            if (socketCell) {
                socketCell.send(BattleTurnStartMessage({
                    roundIndex,
                    turnIndex,
                    characterId,
                    startTime
                }));
            }
        });
    };

    start = (battle: Battle) => {
        const { battleId, cycleEngine } = battle;

        logger.info('Battle [' + battleId + '] -', 'Cycle start');

        const promise = cycleEngine.start();

        battle.cycleRunning = true;

        this.beforeTurnStart(battle, cycleEngine);

        return promise;
    };

    stop = async (battle: Battle) => {
        const { battleId, cycleEngine } = battle;

        logger.info('Battle [' + battleId + '] -', 'Cycle ending...');

        await cycleEngine.stop();

        battle.cycleRunning = false;

        logger.info('Battle [' + battleId + '] -', 'Cycle ended.');
    };

    onNewState = ({ cycleEngine }: Battle, { characters }: Pick<SerializableState, 'characters'>) => {
        const deadCharactersIds = ObjectTyped.entries(characters.health)
            .filter(([ characterId, health ]) => !CharacterUtils.isAlive(health))
            .map(([ characterId ]) => characterId);

        cycleEngine.disableCharacters(deadCharactersIds);
    };
};
