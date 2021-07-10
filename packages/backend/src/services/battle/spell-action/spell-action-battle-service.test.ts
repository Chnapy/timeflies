import { createPosition, SpellAction } from '@timeflies/common';
import { timerTester } from '@timeflies/devtools';
import { BattleNotifyMessage, BattleSpellActionMessage } from '@timeflies/socket-messages';
import { CheckSpellParams, spellActionCheck } from '@timeflies/spell-checker';
import { getSpellRangeArea, SpellEffect } from '@timeflies/spell-effects';
import { createFakeGlobalEntitiesNoService, createFakeSocketCell } from '../../service-test-utils';
import { createServices } from '../../services';
import { createFakeBattle } from '../battle-service-test-utils';
import { SpellActionBattleService } from './spell-action-battle-service';

describe('spell action battle service', () => {

    describe('on spell-action message', () => {
        it('throw error if player not in battle', async () => {

            const socketCell = createFakeSocketCell();
            const battle = createFakeBattle();
            const service = new SpellActionBattleService(createFakeGlobalEntitiesNoService(undefined, battle));

            service.onSocketConnect(socketCell, 'p10');

            const listener = socketCell.getFirstListener(BattleSpellActionMessage);

            await expect(listener(BattleSpellActionMessage({
                spellAction: {
                    checksum: battle.stateStack[ 0 ].checksum,
                    spellId: 's1',
                    duration: 1,
                    launchTime: 1,
                    targetPos: createPosition(0, 0)
                }
            }).get(), socketCell.send)).rejects.toBeDefined();
        });

        const getDefaultEntities = () => {
            const socketCell = createFakeSocketCell();
            const battle = createFakeBattle();
            const globalEntities = createFakeGlobalEntitiesNoService(undefined, battle);
            const service = new SpellActionBattleService(globalEntities);
            service.services = createServices(globalEntities);

            service.onSocketConnect(socketCell, 'p1');

            const spellActionListener = socketCell.getFirstListener(BattleSpellActionMessage);

            const socketCellP2 = createFakeSocketCell();
            const socketCellP3 = createFakeSocketCell();

            service.onSocketConnect(socketCellP2, 'p2');
            service.onSocketConnect(socketCellP3, 'p3');

            return { socketCell, battle, service, spellActionListener, socketCellP2, socketCellP3 };
        };

        describe('on wrong spell-action', () => {

            it('do not change battle state stack', async () => {
                const { spellActionListener, battle, socketCell } = getDefaultEntities();

                const previousStateStack = [ ...battle.stateStack ];

                await spellActionListener(BattleSpellActionMessage({
                    spellAction: {
                        checksum: 'wrong-checksum',
                        spellId: 's1',
                        duration: 1,
                        launchTime: 1,
                        targetPos: createPosition(1, 0)
                    }
                }).get(), socketCell.send);

                expect(battle.stateStack).toEqual(previousStateStack);
            });

            it('response with fail & last state', async () => {
                const { spellActionListener, battle, socketCell } = getDefaultEntities();

                await spellActionListener(BattleSpellActionMessage({
                    spellAction: {
                        checksum: 'wrong-checksum',
                        spellId: 's1',
                        duration: 1,
                        launchTime: 1,
                        targetPos: createPosition(1, 0)
                    }
                }).get(), socketCell.send);

                expect(socketCell.send).toHaveBeenCalledWith(BattleSpellActionMessage.createResponse(expect.any(String), {
                    success: false,
                    lastState: battle.stateStack[ 0 ]
                }));
            });

        });

        describe('on correct spell-action', () => {

            it('add new state to battle state stack', async () => {

                const { spellActionListener, battle, socketCell } = getDefaultEntities();

                const lastState = battle.stateStack[ 0 ];

                const charactersPositions = lastState.characters.position;

                const context: CheckSpellParams[ 'context' ] = {
                    clientContext: {
                        playerId: 'p1'
                    },
                    currentTurn: {
                        playerId: 'p1',
                        characterId: 'c1',
                        startTime: 1
                    },
                    map: {
                        tiledMap: battle.tiledMap,
                        rangeArea: getSpellRangeArea('simpleAttack', {
                            tiledMap: battle.tiledMap,
                            rangeArea: 500,
                            lineOfSight: false,
                            characterList: [ 'c1', 'c2', 'c3' ],
                            charactersPositions,
                            playingCharacterId: 'c1'
                        })
                    },
                    state: lastState,
                    staticState: battle.staticState
                };

                const spellAction: SpellAction = {
                    checksum: lastState.checksum,
                    spellId: 's1',
                    duration: 1,
                    launchTime: 1,
                    targetPos: createPosition(0, 0)
                };

                const checkResult = await spellActionCheck({ spellAction, context });

                if (!checkResult.success) {
                    throw new Error('check result false');
                }

                await timerTester.waitTimer(
                    spellActionListener(BattleSpellActionMessage({
                        spellAction
                    }).get(), socketCell.send)
                );

                expect(battle.stateStack).toEqual([ lastState, checkResult.newState ]);
            });

            it('response with success', async () => {

                const { spellActionListener, battle, socketCell } = getDefaultEntities();

                await timerTester.waitTimer(
                    spellActionListener(BattleSpellActionMessage({
                        spellAction: {
                            checksum: battle.stateStack[ 0 ].checksum,
                            spellId: 's1',
                            duration: 1,
                            launchTime: 1,
                            targetPos: createPosition(0, 0)
                        }
                    }).get(), socketCell.send)
                );

                expect(socketCell.send).toHaveBeenCalledWith(BattleSpellActionMessage.createResponse(expect.any(String), {
                    success: true
                }));
            });

            it('send notify message to others players', async () => {

                const { spellActionListener, battle, socketCell: socketCellP1, socketCellP2, socketCellP3 } = getDefaultEntities();

                const spellAction: SpellAction = {
                    checksum: battle.stateStack[ 0 ].checksum,
                    spellId: 's1',
                    duration: 1,
                    launchTime: 1,
                    targetPos: createPosition(0, 0)
                };

                await timerTester.waitTimer(
                    spellActionListener(BattleSpellActionMessage({
                        spellAction
                    }).get(), socketCellP1.send)
                );

                for (const socketCell of [ socketCellP2, socketCellP3 ]) {
                    expect(socketCell.send).toHaveBeenCalledWith(BattleNotifyMessage({
                        spellAction,
                        spellEffect: expect.objectContaining<SpellEffect>({
                            actionArea: expect.any(Array),
                            duration: expect.any(Number)
                        })
                    }));
                }

                expect(socketCellP1.send).not.toHaveBeenCalledWith(BattleNotifyMessage(expect.anything()));
            });

            it('send messages in correct order: notify, then response', async () => {

                const { spellActionListener, battle, socketCell, socketCellP2 } = getDefaultEntities();

                const callOrder: string[] = [];

                socketCell.send = jest.fn(message => callOrder.push(message.action));
                socketCellP2.send = jest.fn(message => callOrder.push(message.action));

                const spellAction: SpellAction = {
                    checksum: battle.stateStack[ 0 ].checksum,
                    spellId: 's1',
                    duration: 1,
                    launchTime: 1,
                    targetPos: createPosition(0, 0)
                };

                await timerTester.waitTimer(
                    spellActionListener(BattleSpellActionMessage({
                        spellAction
                    }).get(), socketCell.send)
                );

                expect(callOrder).toEqual([
                    BattleNotifyMessage.action,
                    BattleSpellActionMessage.action
                ]);
            });
        });
    });

});
