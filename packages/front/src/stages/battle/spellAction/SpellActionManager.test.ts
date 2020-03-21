import { StoreTest } from '../../../StoreTest';
import { TimerTester, SpellActionSnapshot, ConfirmSAction } from '@timeflies/shared';
import { serviceNetwork } from '../../../services/serviceNetwork';
import { SendMessageAction, ReceiveMessageAction } from '../../../socket/WSClient';
import { BStateSpellLaunchAction, BStateTurnEndAction, BStateTurnStartAction } from '../battleState/BattleStateSchema';
import { Spell } from '../entities/Spell';
import { BattleCommitAction } from '../snapshot/SnapshotManager';
import { SpellActionManager } from './SpellActionManager';
import { BattleDataCurrent, BattleDataFuture } from '../../../BattleData';

describe('# SpellActionManager', () => {

    const timerTester = new TimerTester();

    const init = () => {

        const startTime = timerTester.now;

        const spellActionSnapshotList: SpellActionSnapshot[] = [];

        const currentBattleData: BattleDataCurrent = {
            battleHash: 'not-defined'
        } as any;

        const futureBattleData: BattleDataFuture = {
            battleHash: 'not-defined',
            spellActionSnapshotList
        } as any;

        StoreTest.initStore({
            data: {
                state: 'battle',
                battleData: {
                    current: currentBattleData,
                    future: futureBattleData
                } as unknown as any
            }
        });

        const manager = SpellActionManager(
            {
                spellActionTimerCreator: () => ({
                    onAdd() { },
                    onRemove() { },
                })
            });

        return {
            startTime,
            spellActionSnapshotList,
            manager,
            currentBattleData,
            futureBattleData
        };
    };

    const rollbackInit = () => {

        const { startTime, spellActionSnapshotList, currentBattleData, futureBattleData } = init();

        const firstHash = 'firstHash';
        futureBattleData.battleHash = firstHash;

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

        const secondHash = 'secondHash';
        futureBattleData.battleHash = secondHash;

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

        return {
            startTime,
            spellActionSnapshotList,
            currentBattleData,
            futureBattleData,
            firstHash,
            secondHash
        }
    };

    beforeEach(() => {
        StoreTest.beforeTest();
        timerTester.beforeTest();
    });

    afterEach(() => {
        StoreTest.afterTest();
        timerTester.afterTest();
    });

    it('should catch spell action, then commit', () => {

        const { startTime, spellActionSnapshotList, futureBattleData } = init();

        futureBattleData.battleHash = '-hash-';

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

        expect(beforeCommit).toHaveBeenCalledTimes(1);

        expect(spellActionSnapshotList).toEqual<SpellActionSnapshot[]>([ {
            startTime,
            duration: 200,
            battleHash: '-hash-',
            spellId: 's1',
            position: { x: -1, y: -1 },
            validated: false
        } ]);

        expect(StoreTest.getActions().slice(1)).toEqual<[ BattleCommitAction ]>([
            {
                type: 'battle/commit',
                time: timerTester.now + 200
            }
        ]);
    });

    describe('on confirm action', () => {

        it('should not rollback on confirm action OK', () => {

            const { startTime, spellActionSnapshotList } = rollbackInit();

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

        it('should rollback on confirm action KO', () => {

            const { startTime, spellActionSnapshotList, firstHash } = rollbackInit();

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

    it('should rollback on turn end', () => {

        const { spellActionSnapshotList, firstHash } = rollbackInit();

        const beforeRollbackList = [ ...spellActionSnapshotList ];

        timerTester.advanceBy(250);

        StoreTest.dispatch<BStateTurnEndAction>({
            type: 'battle/state/event',
            eventType: 'TURN-END',
            payload: {}
        });

        expect(spellActionSnapshotList).toEqual([
            beforeRollbackList.find(s => s.battleHash === firstHash)
        ]);
    });

    it('should clear snapshot list on turn start', () => {

        const { spellActionSnapshotList } = rollbackInit();

        StoreTest.dispatch<BStateTurnStartAction>({
            type: 'battle/state/event',
            eventType: 'TURN-START',
            payload: {
                characterId: 'not-matter'
            }
        });

        expect(spellActionSnapshotList).toHaveLength(0);
    });
});
