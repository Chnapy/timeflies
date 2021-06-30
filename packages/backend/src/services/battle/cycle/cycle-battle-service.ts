import { CharacterUtils, ObjectTyped, PlayerId, SerializableState } from '@timeflies/common';
import { createCycleEngine as _createCycleEngine, CycleEngineProps, TurnInfos } from '@timeflies/cycle-engine';
import { logger } from '@timeflies/devtools';
import { BattleTurnStartMessage } from '@timeflies/socket-messages';
import { Service } from '../../service';
import { BattleId } from '../battle';

type GetCycleEngineProps = Pick<CycleEngineProps, 'charactersList' | 'charactersDurations'> & {
    battleId: BattleId;
    playerIdList: Set<PlayerId>;
};

export class CycleBattleService extends Service {
    afterSocketConnect = () => { };

    createCycleEngineOverlay = ({
        battleId,
        charactersList,
        charactersDurations,
        playerIdList
    }: GetCycleEngineProps, createCycleEngine = _createCycleEngine) => {
        let cycleRunning = false;
        let currentTurnInfos: TurnInfos | null = null;

        const beforeTurnStart = () => {
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

        const cycleEngine = createCycleEngine({
            charactersList,
            charactersDurations,
            listeners: {
                turnStart: ({ currentTurn }) => {
                    currentTurnInfos = currentTurn;

                    logger.info('Battle [' + battleId + '] -', 'Cycle turn start', currentTurn);
                },
                turnEnd: async ({ currentTurn }) => {
                    logger.info('Battle [' + battleId + '] -', 'Cycle turn end', currentTurn);

                    await this.services.playerBattleService.checkLeavedAndDisconnectedPlayers(battleId);

                    if (cycleRunning) {
                        beforeTurnStart();
                        return cycleEngine.startNextTurn();
                    }
                }
            }
        });

        const start = () => {
            logger.info('Battle [' + battleId + '] -', 'Cycle start');

            const promise = cycleEngine.start();

            cycleRunning = true;

            beforeTurnStart();

            return promise;
        };

        const stop = async () => {
            logger.info('Battle [' + battleId + '] -', 'Cycle ending...');

            await cycleEngine.stop();

            cycleRunning = false;

            logger.info('Battle [' + battleId + '] -', 'Cycle ended.');
        };

        const onNewState = ({ characters }: Pick<SerializableState, 'characters'>) => {
            const deadCharactersIds = ObjectTyped.entries(characters.health)
                .filter(([ characterId, health ]) => !CharacterUtils.isAlive(health))
                .map(([ characterId ]) => characterId);

            cycleEngine.disableCharacters(deadCharactersIds);
        };

        return {
            start,
            stop,
            onNewState,
            isStarted: () => cycleEngine.isStarted(),
            isRunning: () => cycleRunning,
            getCurrentTurnInfos: () => currentTurnInfos
        };
    };
};
