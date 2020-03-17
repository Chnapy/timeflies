import { TimerTester } from '@timeflies/shared';
import { StoreTest } from '../../../StoreTest';
import { seedCharacter } from '../../../__seeds__/seedCharacter';
import { BState, BStateAction } from '../battleState/BattleStateSchema';
import { BStateMachine } from '../battleState/BStateMachine';
import { CycleManager } from '../cycle/CycleManager';
import { seedMapManager } from '../map/MapManager.seed';
import { SnapshotManager } from '../snapshot/SnapshotManager';
import { serviceNetwork } from '../../../services/serviceNetwork';
import { SpellActionManager } from '../spellAction/SpellActionManager';
import { SendMessageAction } from '../../../socket/WSClient';

describe('Battle workflow', () => {

    const timerTester = new TimerTester();

    const init = () => {
        const character = seedCharacter();

        StoreTest.initStore({
            data: {
                state: 'battle',
                battleData: {
                    cycle: {
                        launchTime: timerTester.now
                    },
                    current: {
                        characters: [ character ]
                    },
                    future: {
                        characters: [ character ],
                        teams: []
                    }
                } as any
            }
        });

        const cycle = CycleManager();

        const snapshotManager = SnapshotManager();

        const spellActionManager = SpellActionManager(snapshotManager);

        const bState = BStateMachine(seedMapManager());

        cycle.start({
            id: 1,
            order: [ character.id ],
            startTime: timerTester.now,
            currentTurn: {
                id: 1,
                characterId: character.id,
                startTime: timerTester.now
            }
        });

        const battleHash = (() => {
            try {
                return snapshotManager.getLastHash();
            } catch (e) {
                return;
            }
        })();

        return {
            character,
            cycle,
            snapshotManager,
            spellActionManager,
            bState,
            battleHash
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

    it('should change battle state to "spellPrepare" on turn start', () => {

        const { bState } = init();

        expect(bState.state).toBe<BState>('spellPrepare');
    });

    it('should change battle state to "watch" on turn end', () => {

        const { bState, character } = init();

        expect(bState.state).toBe<BState>('spellPrepare');

        timerTester.advanceBy(character.features.actionTime);

        expect(bState.state).toBe<BState>('watch');
    });

    it('should commit on turn end', () => {

        const { snapshotManager, character, battleHash } = init();

        timerTester.advanceBy(character.features.actionTime);

        expect(snapshotManager.getLastHash()).not.toBe(battleHash);
    });

    it('should commit after spell action', async () => {

        const { snapshotManager, character, battleHash } = init();

        StoreTest.dispatch<BStateAction>({
            type: 'battle/state/event',
            eventType: 'SPELL-LAUNCH',
            payload: {
                spellActions: [ {
                    spell: character.defaultSpell,
                    position: { x: -1, y: -1 },
                    beforeCommit: jest.fn()
                } ]
            }
        });

        await serviceNetwork({});

        expect(snapshotManager.getLastHash()).not.toBe(battleHash);
    });

    it('should send message after spell action', async () => {

        const { character } = init();

        StoreTest.clearActions();

        StoreTest.dispatch<BStateAction>({
            type: 'battle/state/event',
            eventType: 'SPELL-LAUNCH',
            payload: {
                spellActions: [ {
                    spell: character.defaultSpell,
                    position: { x: -1, y: -1 },
                    beforeCommit: jest.fn()
                } ]
            }
        });

        await serviceNetwork({});

        expect(StoreTest.getActions()).toEqual(
            expect.arrayContaining<SendMessageAction>([
                expect.objectContaining<SendMessageAction>({
                    type: 'message/send',
                    message: {
                        type: 'battle/spellAction',
                        spellAction: expect.anything()
                    }
                })
            ])
        );
    });
});
