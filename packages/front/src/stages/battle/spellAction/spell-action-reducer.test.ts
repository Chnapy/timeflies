import { seedSpellActionSnapshot } from '@timeflies/shared';
import { BattleStateTurnStartAction } from '../battleState/battle-state-actions';
import { SpellActionLaunchAction, SpellActionTimerEndAction, SpellActionCancelAction } from './spell-action-actions';
import { spellActionReducer, SpellActionState } from './spell-action-reducer';
import { seedCharacter } from '../entities/character/Character.seed';

describe('# spell-action-reducer', () => {

    describe('on spell launch action', () => {

        it('should store snapshot list', () => {

            const initialState: SpellActionState = {
                currentSpellAction: null,
                spellActionSnapshotList: []
            };

            const spellActionSnapshotList = [
                seedSpellActionSnapshot('s1'),
                seedSpellActionSnapshot('s2')
            ];

            const state1 = spellActionReducer(initialState, SpellActionLaunchAction({
                spellActionSnapshotList
            }));

            expect(state1.spellActionSnapshotList).toEqual(spellActionSnapshotList);
        });

        it('should not set current spell if already defined', () => {

            const initialState: SpellActionState = {
                currentSpellAction: seedSpellActionSnapshot('s0'),
                spellActionSnapshotList: []
            };

            const spellActionSnapshotList = [
                seedSpellActionSnapshot('s1'),
                seedSpellActionSnapshot('s2')
            ];

            const state1 = spellActionReducer(initialState, SpellActionLaunchAction({
                spellActionSnapshotList
            }));

            expect(state1.currentSpellAction).toEqual(initialState.currentSpellAction);
        });

        it('should set current spell if not defined', () => {

            const initialState: SpellActionState = {
                currentSpellAction: null,
                spellActionSnapshotList: []
            };

            const spellActionSnapshotList = [
                seedSpellActionSnapshot('s1'),
                seedSpellActionSnapshot('s2')
            ];

            const state1 = spellActionReducer(initialState, SpellActionLaunchAction({
                spellActionSnapshotList
            }));

            expect(state1.currentSpellAction).toEqual(spellActionSnapshotList[ 0 ]);
        });
    });

    it('should reset current spell on spell timer end action', () => {

        const initialState: SpellActionState = {
            currentSpellAction: seedSpellActionSnapshot('s1'),
            spellActionSnapshotList: []
        };

        const state1 = spellActionReducer(initialState, SpellActionTimerEndAction({
            removed: false,
            correctHash: '',
            spellActionSnapshot: initialState.currentSpellAction!
        }));

        expect(state1.currentSpellAction).toEqual(null);
    });

    it('should clear snapshot list on turn start action', () => {

        const initialState: SpellActionState = {
            currentSpellAction: null,
            spellActionSnapshotList: [
                seedSpellActionSnapshot('s1'),
                seedSpellActionSnapshot('s2')
            ]
        };

        const state1 = spellActionReducer(initialState, BattleStateTurnStartAction({
            turnSnapshot: {
                id: 1,
                characterId: '1',
                startTime: -1,
                duration: -1
            },
            currentCharacter: seedCharacter({ id: '', period: 'current' })
        }));

        expect(state1.spellActionSnapshotList).toHaveLength(0);
    });

    describe('on spell cancel action', () => {

        it('should remove current spell', () => {

            const initialState: SpellActionState = {
                currentSpellAction: seedSpellActionSnapshot('s1'),
                spellActionSnapshotList: []
            };

            const state1 = spellActionReducer(initialState, SpellActionCancelAction({
                spellActionSnapshotsValids: []
            }));

            expect(state1.currentSpellAction).toEqual(null);
        });

        it('should clear snapshot list', () => {

            const initialState: SpellActionState = {
                currentSpellAction: null,
                spellActionSnapshotList: [
                    seedSpellActionSnapshot('s1'),
                    seedSpellActionSnapshot('s2')
                ]
            };

            const state1 = spellActionReducer(initialState, SpellActionCancelAction({
                spellActionSnapshotsValids: initialState.spellActionSnapshotList.slice(0, 1)
            }));

            expect(state1.spellActionSnapshotList).toEqual(initialState.spellActionSnapshotList.slice(0, 1));
        });
    });
});
