import { StoreTest } from '../../../StoreTest';
import { TimerTester } from '@timeflies/shared';
import { serviceNetwork } from '../../../services/serviceNetwork';
import { SendMessageAction } from '../../../socket/WSClient';
import { BStateSpellLaunchAction } from '../battleState/BattleStateSchema';
import { Spell } from '../entities/Spell';
import { BattleCommitAction } from '../snapshot/SnapshotManager';
import { SpellActionManager } from './SpellActionManager';

describe('# SpellActionManager', () => {

    const timerTester = new TimerTester();

    beforeEach(() => {
        StoreTest.beforeTest();
        timerTester.beforeTest();
    });

    afterEach(() => {
        StoreTest.afterTest();
        timerTester.afterTest();
    });

    it('should catch spell action, then commit & send', async () => {

        const startTime = timerTester.now;

        const manager = SpellActionManager({
            getLastHash() {
                return '-hash-';
            }
        });

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
                        position: { x: -1, y: -1 }
                    }
                }
            }
        ]);

    });
});
