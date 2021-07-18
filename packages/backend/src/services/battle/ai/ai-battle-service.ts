import { CharacterId, CharacterUtils, getSpellCategory, SpellAction, StaticCharacter, switchUtil } from '@timeflies/common';
import { logger } from '@timeflies/devtools';
import { BattleNotifyMessage } from '@timeflies/socket-messages';
import { Battle } from '../battle';
import { BattleAbstractService } from '../battle-abstract-service';
import { AIScenarioProps, Simulation } from './ai-scenario';
import { createAIScenarioUtils } from './ai-scenario-utils';
import { offensiveToEnemyAIScenario } from './ai-scenarios/offensive-to-enemy-ai-scenario';
import { offensiveToEnemyLowLifeAIScenario } from './ai-scenarios/offensive-to-enemy-low-life-ai-scenario';
import { placementToEnemyAIScenario } from './ai-scenarios/placement-to-enemy-ai-scenario';
import { supportAllyOnceAIScenario } from './ai-scenarios/support-ally-once-ai-scenario';
import { supportAndPlacementToAllyLowLifeAIScenario } from './ai-scenarios/support-and-placement-to-ally-low-life-ai-scenario';


const AIScenarioList = [

    offensiveToEnemyLowLifeAIScenario,
    supportAndPlacementToAllyLowLifeAIScenario,
    supportAllyOnceAIScenario,
    offensiveToEnemyAIScenario,
    placementToEnemyAIScenario

];

export class AIBattleService extends BattleAbstractService {
    afterSocketConnect = () => { };

    executeTurn = async (battle: Battle, currentCharacterId: CharacterId, { scenarioList }: {
        scenarioList: typeof AIScenarioList;
    } = { scenarioList: AIScenarioList }) => {

        const character = battle.staticState.characters[ currentCharacterId ];
        const player = battle.staticState.players[ character.playerId ];

        const spells = battle.staticSpells.filter(s => s.characterId === currentCharacterId);

        let simulationList: Simulation[] = [];
        let stateEndTime = battle.currentTurnInfos!.startTime;

        const scenariosUsesMap = scenarioList.map(() => 0);

        const getTempStateStack = () => [
            ...battle.stateStack,
            ...simulationList.map(s => s.state)
        ];

        const simulateSpellAction: AIScenarioProps[ 'simulateSpellAction' ] = async (spellId, targetPos, {
            multiplyDurationBy = 1
        } = {}) => {
            const battleWithTempStateStack: Battle = {
                ...battle,
                stateStack: getTempStateStack()
            };

            const spellAction: SpellAction = {
                checksum: '',
                spellId,
                duration: this.getCurrentState(battleWithTempStateStack).spells.duration[ spellId ] * multiplyDurationBy,
                launchTime: stateEndTime,
                targetPos
            };

            const checkResult = await this.services.spellActionBattleService.simulateSpellAction(battleWithTempStateStack, {
                playerId: player.playerId,
                spellAction,
                checkChecksum: false
            });

            if (!checkResult.success) {
                return null;
            }

            const simulation: Simulation = {
                spellAction,
                state: checkResult.newState,
                spellEffect: checkResult.spellEffect
            };

            return {
                simulation,
                execute: () => {
                    simulationList.push(simulation);

                    stateEndTime = spellAction.launchTime + spellAction.duration;
                }
            };
        };

        const getScenarioProps = (nbrScenarioUses: number): AIScenarioProps => {

            const battleWithTempStateStack: Battle = {
                ...battle,
                stateStack: getTempStateStack()
            };

            const getInitialState = () => this.getInitialState({
                stateStack: getTempStateStack()
            });
            const getCurrentState = () => this.getCurrentState({
                stateStack: getTempStateStack()
            });

            const getCharacterList = (relation: 'enemy' | 'ally') => {
                const { staticCharacters, staticState } = battleWithTempStateStack;

                const filterFn = switchUtil(relation, {
                    enemy: ({ playerId }: StaticCharacter) => staticState.players[ playerId ].teamColor !== player.teamColor,
                    ally: ({ playerId }: StaticCharacter) => staticState.players[ playerId ].teamColor === player.teamColor
                        && playerId !== player.playerId
                });

                return staticCharacters.filter(c => filterFn(c)
                    && CharacterUtils.isAlive(getCurrentState().characters.health[ c.characterId ]));
            };

            const utils = createAIScenarioUtils({
                battle: battleWithTempStateStack,
                getInitialState,
                getCurrentState,
                currentCharacterId
            });

            return {
                battle: battleWithTempStateStack,
                currentCharacter: battle.staticState.characters[ currentCharacterId ],
                staticSpells: {
                    offensive: spells.filter(s => getSpellCategory(s.spellRole) === 'offensive'),
                    support: spells.filter(s => getSpellCategory(s.spellRole) === 'support'),
                    placement: spells.filter(s => getSpellCategory(s.spellRole) === 'placement'),
                },
                getInitialState,
                getCurrentState,
                stateEndTime,
                enemyList: getCharacterList('enemy'),
                allyList: getCharacterList('ally'),

                nbrScenarioUses,
                utils,

                simulateSpellAction
            };
        };

        const runEveryScenarios = async () => {
            for (let i = 0; i < scenarioList.length; i++) {
                const scenario = scenarioList[ i ];

                const previousStateEndTime = stateEndTime;
                const previousSimulationList = [ ...simulationList ];

                const scenarioProps = getScenarioProps(scenariosUsesMap[ i ]);

                const success = await scenario(scenarioProps);
                scenariosUsesMap[ i ]++;

                if (scenariosUsesMap[ i ] > 40) {
                    logger.error(new Error('AI infinite loop detected in scenario runs, i=' + i));
                    return;
                }

                if (success) {
                    await runEveryScenarios();
                    return;
                } else {
                    stateEndTime = previousStateEndTime;
                    simulationList = [ ...previousSimulationList ];
                }
            }
        };

        await runEveryScenarios();

        if (!simulationList.length) {
            return;
        }

        const messageAndPromiseList = simulationList.map(({ spellAction, state, spellEffect }) => {

            const notifyMessage = BattleNotifyMessage({
                spellAction,
                spellEffect
            });

            const promise = this.services.spellActionBattleService.addNewStateWithSpellAction(battle, state, spellAction);

            return { notifyMessage, promise };
        });

        const messageList = messageAndPromiseList.map(({ notifyMessage }) => notifyMessage);

        battle.staticPlayers
            .filter(p => p.playerId !== player.playerId)
            .map(player => this.playerSocketMap[ player.playerId ])
            .forEach(playerSocketCell => {
                if (playerSocketCell) {
                    playerSocketCell.send(...messageList);
                }
            });

        await Promise.all(messageAndPromiseList.map(({ promise }) => promise));
    };
};
