import { StoreTest } from '../../../StoreTest';
import { TimerTester, SpellActionSnapshot, ConfirmSAction } from '@timeflies/shared';
import { serviceNetwork } from '../../../services/serviceNetwork';
import { SendMessageAction, ReceiveMessageAction } from '../../../socket/WSClient';
import { BStateSpellLaunchAction } from '../battleState/BattleStateSchema';
import { Spell } from '../entities/Spell';
import { BattleCommitAction } from '../snapshot/SnapshotManager';
import { SpellActionManager } from './SpellActionManager';

describe('# SpellActionManager', () => {

    const timerTester = new TimerTester();

    const init = (getLastHash: () => string) => {

        const startTime = timerTester.now;

        const spellActionSnapshotList: SpellActionSnapshot[] = [];

        StoreTest.initStore({
            data: {
                state: 'battle',
                battleData: {
                    future: {
                        spellActionSnapshotList
                    }
                } as any
            }
        });

        const manager = SpellActionManager({
            getLastHash
        });

        return {
            startTime,
            spellActionSnapshotList,
            manager
        };
    };

    beforeEach(() => {
        StoreTest.beforeTest();
        timerTester.beforeTest();
    });

    afterEach(() => {
        StoreTest.afterTest();
        timerTester.afterTest();
    });

    it('should catch spell action, then commit & send', async () => {

        const { startTime, spellActionSnapshotList } = init(
            () => '-hash-'
        );

        const beforeCommit = jest.fn();

        StoreTest.dispatch<BStateSpellLaunchAction>({
            type: 'battle/state/event',
            eventType: 'SPELL-LAUNCH',
            payload: {
                spellActions: [
                    {
                        spell: {
                            id: 's1',
                            staticData: {
                                id: 's1',
                            },
                            feature: {
                                duration: 200
                            }
                        } as Spell,
                        position: { x: -1, y: -1 },
                        beforeCommit
                    }
                ]
            }
        });

        await serviceNetwork({});

        expect(beforeCommit).toHaveBeenCalledTimes(1);

        expect(spellActionSnapshotList).toEqual<SpellActionSnapshot[]>([ {
            startTime,
            duration: 200,
            battleHash: '-hash-',
            spellId: 's1',
            position: { x: -1, y: -1 }
        } ]);

        expect(StoreTest.getActions().slice(1)).toEqual<[ BattleCommitAction, SendMessageAction ]>([
            {
                type: 'battle/commit'
            },
            {
                type: 'message/send',
                message: {
                    type: 'battle/spellAction',
                    spellAction: {
                        spellId: 's1',
                        battleHash: '-hash-',
                        startTime,
                        duration: 200,
                        position: { x: -1, y: -1 }
                    }
                }
            }
        ]);

    });

    describe('on confirm action', () => {

        const rollbackInit = async () => {
            let getLastHash: () => string;

            const { startTime, spellActionSnapshotList } = init(
                () => getLastHash()
            );

            const firstHash = 'firstHash';
            getLastHash = () => firstHash;

            StoreTest.dispatch<BStateSpellLaunchAction>({
                type: 'battle/state/event',
                eventType: 'SPELL-LAUNCH',
                payload: {
                    spellActions: [
                        {
                            spell: {
                                id: 's1',
                                staticData: {
                                    id: 's1',
                                },
                                feature: {
                                    duration: 200
                                }
                            } as Spell,
                            position: { x: -1, y: -1 },
                            beforeCommit: () => { }
                        }
                    ]
                }
            });

            await serviceNetwork({});

            const secondHash = 'secondHash';
            getLastHash = () => secondHash;

            StoreTest.dispatch<BStateSpellLaunchAction>({
                type: 'battle/state/event',
                eventType: 'SPELL-LAUNCH',
                payload: {
                    spellActions: [
                        {
                            spell: {
                                id: 's1',
                                staticData: {
                                    id: 's1',
                                },
                                feature: {
                                    duration: 200
                                }
                            } as Spell,
                            position: { x: 0, y: -1 },
                            beforeCommit: () => { }
                        }
                    ]
                }
            });

            await serviceNetwork({});

            return {
                startTime,
                spellActionSnapshotList,
                firstHash,
                secondHash
            }
        };

        it('should not rollback on confirm action OK', async () => {

            const { startTime, spellActionSnapshotList } = await rollbackInit();

            const beforeRollbackList = [ ...spellActionSnapshotList ];

            StoreTest.dispatch<ReceiveMessageAction<ConfirmSAction>>({
                type: 'message/receive',
                message: {
                    type: 'confirm',
                    sendTime: startTime,
                    isOk: true,
                    lastCorrectHash: 'not-matter'
                }
            });

            expect(spellActionSnapshotList).toEqual(beforeRollbackList);
        });

        it('should throw assert error on confirm action KO with unknown hash', async () => {

            const { startTime } = await rollbackInit();

            expect(() => {
                StoreTest.dispatch<ReceiveMessageAction<ConfirmSAction>>({
                    type: 'message/receive',
                    message: {
                        type: 'confirm',
                        sendTime: startTime,
                        isOk: false,
                        lastCorrectHash: 'unknown-hash'
                    }
                });
            }).toThrowError();
        });

        it('should rollback on confirm action KO', async () => {

            const { startTime, spellActionSnapshotList, firstHash } = await rollbackInit();

            const beforeRollbackList = [ ...spellActionSnapshotList ];

            StoreTest.dispatch<ReceiveMessageAction<ConfirmSAction>>({
                type: 'message/receive',
                message: {
                    type: 'confirm',
                    sendTime: startTime,
                    isOk: false,
                    lastCorrectHash: firstHash
                }
            });

            expect(spellActionSnapshotList).toEqual([
                beforeRollbackList.find(s => s.battleHash === firstHash)
            ]);
        });

    });
});
