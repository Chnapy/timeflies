import { ArrayUtils, createPosition, SerializableState, SpellAction } from '@timeflies/common';
import { BattleNotifyMessage, BattleSpellActionMessage, Message } from '@timeflies/socket-messages';
import { SocketCell } from '@timeflies/socket-server';
import { computeChecksum, SpellEffect } from '@timeflies/spell-effects';
import { TiledLayer } from 'tiled-types';
import { Battle } from '../battle';
import { spellActionBattleService } from './spell-action-battle-service';

describe('spell action battle service', () => {

    type SocketCellTestable = SocketCell & {
        _listeners: { [ type in Message[ 'action' ] ]: Array<(...args: any[]) => void> };
    };

    const createFakeSocketCell = (): SocketCellTestable => {

        const _listeners: SocketCellTestable[ '_listeners' ] = {};

        return {
            addMessageListener: (messageCreator, listener) => {
                _listeners[ messageCreator.action ] = _listeners[ messageCreator.action ] ?? [];
                _listeners[ messageCreator.action ].push(listener);

                return jest.fn();
            },
            addDisconnectListener: jest.fn(),
            clearAllListeners: jest.fn(),
            closeSocket: jest.fn(),
            createCell: jest.fn(),
            send: jest.fn(),
            _listeners
        };
    };

    const createFakeBattle = (): Battle => ({
        battleId: 'battle',
        staticPlayers: [
            { playerId: 'p1' } as any,
            { playerId: 'p2' } as any,
            { playerId: 'p3' } as any
        ],
        staticCharacters: [],
        staticSpells: [],
        staticState: {
            players: {},
            characters: {
                c1: {
                    characterId: 'c1',
                    playerId: 'p1',
                    characterRole: 'meti',
                    defaultSpellId: 's1'
                }
            },
            spells: {
                s1: {
                    spellId: 's1',
                    characterId: 'c1',
                    spellRole: 'simpleAttack'
                }
            }
        },
        tiledMap: {
            layers: [ {
                name: 'obstacles',
                data: ArrayUtils.range(50)
            } as TiledLayer ]
        } as any,
        playerJoin: jest.fn(),
        getMapInfos: jest.fn(),
        getCycleInfos: jest.fn(),
        getCurrentState: jest.fn(() => {

            const state: SerializableState = {
                checksum: '',
                time: 1,
                characters: {
                    health: { c1: 100 },
                    position: { c1: createPosition(0, 0) },
                    actionTime: { c1: 1000 },
                    orientation: { c1: 'bottom' }
                },
                spells: {
                    rangeArea: { s1: 500 },
                    actionArea: { s1: 1 },
                    lineOfSight: { s1: false },
                    duration: { s1: 1 },
                    attack: { s1: 10 }
                }
            };
            state.checksum = computeChecksum(state);
            return state;
        }),
        getCurrentTurnInfos: jest.fn(() => ({
            characterId: 'c1',
            startTime: 1
        })),
        addNewState: jest.fn()
    });

    it('if player not in battle, throw error', async () => {

        const socketCell = createFakeSocketCell();
        const battle = createFakeBattle();
        const service = spellActionBattleService({
            currentBattleMap: {
                mapById: {
                    battle
                },
                mapByPlayerId: {
                    p1: battle,
                    p2: battle
                }
            }
        });

        service.onSocketConnect(socketCell, 'p10');

        const listener = socketCell._listeners[ BattleSpellActionMessage.action ][ 0 ];

        await expect(listener(BattleSpellActionMessage({
            spellAction: {
                checksum: battle.getCurrentState().checksum,
                spellId: 's1',
                duration: 1,
                launchTime: 1,
                targetPos: createPosition(0, 0)
            }
        }).get())).rejects.toBeDefined();
    });

    const getDefaultEntities = () => {
        const socketCell = createFakeSocketCell();
        const battle = createFakeBattle();
        const service = spellActionBattleService({
            currentBattleMap: {
                mapById: {
                    battle
                },
                mapByPlayerId: {
                    p1: battle,
                    p2: battle,
                    p3: battle
                }
            }
        });

        service.onSocketConnect(socketCell, 'p1');

        const spellActionListener = socketCell._listeners[ BattleSpellActionMessage.action ][ 0 ];

        const socketCellP2 = createFakeSocketCell();
        const socketCellP3 = createFakeSocketCell();

        service.onSocketConnect(socketCellP2, 'p2');
        service.onSocketConnect(socketCellP3, 'p3');

        return { socketCell, battle, service, spellActionListener, socketCellP2, socketCellP3 };
    };

    describe('on wrong spell-action message', () => {

        it('do not change battle state stack', async () => {

            const { spellActionListener, battle } = getDefaultEntities();

            await spellActionListener(BattleSpellActionMessage({
                spellAction: {
                    checksum: 'wrong-checksum',
                    spellId: 's1',
                    duration: 1,
                    launchTime: 1,
                    targetPos: createPosition(1, 0)
                }
            }).get());

            expect(battle.addNewState).not.toHaveBeenCalled();
        });

        it('response with fail & last state', async () => {

            const { spellActionListener, battle } = getDefaultEntities();

            const response = await spellActionListener(BattleSpellActionMessage({
                spellAction: {
                    checksum: 'wrong-checksum',
                    spellId: 's1',
                    duration: 1,
                    launchTime: 1,
                    targetPos: createPosition(1, 0)
                }
            }).get());

            expect(response).toEqual(BattleSpellActionMessage.createResponse(expect.any(String), {
                success: false,
                lastState: battle.getCurrentState()
            }));
        });

    });

    describe('on correct spell-action message', () => {

        it('add new state to battle state stack', async () => {

            const { spellActionListener, battle } = getDefaultEntities();

            const previousChecksum = battle.getCurrentState().checksum;

            await spellActionListener(BattleSpellActionMessage({
                spellAction: {
                    checksum: previousChecksum,
                    spellId: 's1',
                    duration: 1,
                    launchTime: 1,
                    targetPos: createPosition(0, 0)
                }
            }).get());

            expect(battle.addNewState).toHaveBeenCalled();
        });

        it('response with success', async () => {

            const { spellActionListener, battle } = getDefaultEntities();

            const response = await spellActionListener(BattleSpellActionMessage({
                spellAction: {
                    checksum: battle.getCurrentState().checksum,
                    spellId: 's1',
                    duration: 1,
                    launchTime: 1,
                    targetPos: createPosition(0, 0)
                }
            }).get());

            expect(response).toEqual(BattleSpellActionMessage.createResponse(expect.any(String), {
                success: true
            }));
        });

        it('send notify message to others players', async () => {

            const { spellActionListener, battle, socketCell: socketCellP1, socketCellP2, socketCellP3 } = getDefaultEntities();

            const spellAction: SpellAction = {
                checksum: battle.getCurrentState().checksum,
                spellId: 's1',
                duration: 1,
                launchTime: 1,
                targetPos: createPosition(0, 0)
            };

            await spellActionListener(BattleSpellActionMessage({
                spellAction
            }).get());

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

    });

});
