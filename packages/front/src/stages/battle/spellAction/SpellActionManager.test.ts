import { SpellActionSnapshot, TimerTester } from '@timeflies/shared';
import { BattleDataCurrent, BattleDataCycle, BattleDataFuture } from '../../../BattleData';
import { ReceiveMessageAction } from '../../../socket/wsclient-actions';
import { StoreTest } from '../../../StoreTest';
import { BattleStateSpellLaunchAction, BattleStateTurnEndAction, BattleStateTurnStartAction } from '../battleState/battle-state-actions';
import { seedCharacter } from '../entities/character/Character.seed';
import { seedSpell } from '../entities/spell/Spell.seed';
import { BattleCommitAction } from '../snapshot/snapshot-manager-actions';
import { SpellActionManager } from './SpellActionManager';

describe('# SpellActionManager', () => {

    const timerTester = new TimerTester();

    const init = () => {

        const startTime = timerTester.now;

        const spellActionSnapshotList: SpellActionSnapshot[] = [];

        const currentCharacter = seedCharacter('fake', {
            period: 'current',
            id: '1',
            player: null
        });

        const futureCharacter = seedCharacter('fake', {
            period: 'future',
            id: '1',
            player: null
        });

        const cycleBattleData: BattleDataCycle = {
            launchTime: -1,
            globalTurn: {
                currentTurn: {
                    character: currentCharacter
                }
            } as any
        };

        const currentBattleData: BattleDataCurrent = {
            battleHash: 'not-defined',
            characters: [ currentCharacter ],
        } as BattleDataCurrent;

        const futureBattleData: BattleDataFuture = {
            battleHash: 'not-defined',
            characters: [ futureCharacter ],
            spellActionSnapshotList
        } as BattleDataFuture;

        StoreTest.initStore({
            battle: {
                cycle: cycleBattleData,
                current: currentBattleData,
                future: futureBattleData
            } as unknown as any
        });

        const manager = SpellActionManager(
            {
                spellActionTimerCreator: () => ({
                    onAdd() { },
                    onRemove() { },
                }),
                getSpellLaunchFn: () => () => { }
            });

        return {
            startTime,
            spellActionSnapshotList,
            manager,
            currentBattleData,
            futureBattleData,
            futureCharacter
        };
    };

    const rollbackInit = () => {

        const { startTime, spellActionSnapshotList, currentBattleData, futureBattleData, futureCharacter } = init();

        const firstHash = 'firstHash';
        futureBattleData.battleHash = firstHash;

        const spell = seedSpell<'future'>('fake', {
            period: 'future',
            id: 's1',
            character: futureCharacter,
            type: 'move',
            initialFeatures: {
                duration: 200
            }
        });

        StoreTest.dispatch(BattleStateSpellLaunchAction({
            spellActions: [
                {
                    spell,
                    position: { x: -1, y: -1 },
                    actionArea: [ { x: -1, y: -1 } ]
                }
            ]
        }));

        const secondHash = 'secondHash';
        futureBattleData.battleHash = secondHash;

        StoreTest.dispatch(BattleStateSpellLaunchAction({
            spellActions: [
                {
                    spell,
                    position: { x: 0, y: -1 },
                    actionArea: [ { x: 0, y: -1 } ]
                }
            ]
        }));

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

        const { startTime, spellActionSnapshotList, futureBattleData, futureCharacter } = init();

        futureBattleData.battleHash = '-hash-';

        const spell = seedSpell('fake', {
            period: 'future',
            id: 's1',
            character: futureCharacter,
            type: 'move',
            initialFeatures: {
                duration: 200
            }
        });

        StoreTest.dispatch(BattleStateSpellLaunchAction({
            spellActions: [
                {
                    spell,
                    position: { x: -1, y: -1 },
                    actionArea: [ { x: -1, y: -1 } ]
                }
            ]
        }));

        expect(spellActionSnapshotList).toEqual<SpellActionSnapshot[]>([ {
            startTime,
            duration: 200,
            battleHash: '-hash-',
            characterId: '1',
            spellId: 's1',
            position: { x: -1, y: -1 },
            actionArea: [ { x: -1, y: -1 } ],
        } ]);

        expect(StoreTest.getActions().slice(1)).toEqual<[ BattleCommitAction ]>([
            BattleCommitAction({
                time: timerTester.now + 200
            })
        ]);
    });

    describe('on confirm action', () => {

        it('should not rollback on confirm action OK', () => {

            const { startTime, spellActionSnapshotList } = rollbackInit();

            const beforeRollbackList = [ ...spellActionSnapshotList ];

            StoreTest.dispatch(ReceiveMessageAction({
                type: 'confirm',
                sendTime: startTime,
                isOk: true,
                lastCorrectHash: 'not-matter'
            }));

            expect(spellActionSnapshotList).toEqual(beforeRollbackList);
        });

        it('should rollback on confirm action KO', () => {

            const { startTime, spellActionSnapshotList, firstHash } = rollbackInit();

            const beforeRollbackList = [ ...spellActionSnapshotList ];

            StoreTest.dispatch(ReceiveMessageAction({
                type: 'confirm',
                sendTime: startTime,
                isOk: false,
                lastCorrectHash: firstHash
            }));

            expect(spellActionSnapshotList).toEqual([
                beforeRollbackList.find(s => s.battleHash === firstHash)
            ]);
        });
    });

    it('should rollback on turn end', () => {

        const { spellActionSnapshotList, firstHash } = rollbackInit();

        const beforeRollbackList = [ ...spellActionSnapshotList ];

        timerTester.advanceBy(250);

        StoreTest.dispatch(BattleStateTurnEndAction());

        expect(spellActionSnapshotList).toEqual([
            beforeRollbackList.find(s => s.battleHash === firstHash)
        ]);
    });

    it('should clear snapshot list on turn start', () => {

        const { spellActionSnapshotList } = rollbackInit();

        StoreTest.dispatch(BattleStateTurnStartAction({
            characterId: 'not-matter'
        }));

        expect(spellActionSnapshotList).toHaveLength(0);
    });

    it('should launch spell on message notify', () => {

        const { startTime, spellActionSnapshotList, futureBattleData, futureCharacter } = init();

        futureBattleData.battleHash = '-hash-';

        const [ spell ] = futureCharacter.spells;

        StoreTest.dispatch(ReceiveMessageAction({
            type: 'notify',
            sendTime: -1,
            spellActionSnapshot: {
                startTime,
                duration: spell.feature.duration,
                battleHash: '-hash-',
                characterId: '1',
                spellId: spell.id,
                position: { x: -1, y: -1 },
                actionArea: [ { x: -1, y: -1 } ],
            }
        }));

        expect(spellActionSnapshotList).toEqual<SpellActionSnapshot[]>([ {
            startTime,
            duration: spell.feature.duration,
            battleHash: '-hash-',
            characterId: '1',
            spellId: spell.id,
            position: { x: -1, y: -1 },
            actionArea: [ { x: -1, y: -1 } ],
        } ]);

        expect(StoreTest.getActions().slice(1)).toEqual<[ BattleCommitAction ]>([
            BattleCommitAction({
                time: timerTester.now + spell.feature.duration
            })
        ]);
    });
});
