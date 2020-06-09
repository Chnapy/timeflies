import { MiddlewareAPI } from '@reduxjs/toolkit';
import { NotifyDeathsAction } from '../cycle/cycle-manager-actions';
import { seedCharacter } from '../entities/character/Character.seed';
import { SpellActionTimerEndAction } from '../spellAction/spell-action-actions';
import { snapshotMiddleware } from './snapshot-middleware';
import { SnapshotState } from './snapshot-reducer';

describe('# snapshot-middleware', () => {

    it('should not notify for deaths on spell action end action if there is not new deaths', () => {

        const currentCharacters = [
            seedCharacter({
                period: 'current',
                id: '1'
            }),
            seedCharacter({
                period: 'current',
                id: '2'
            })
        ];

        const initialState: SnapshotState = {
            myPlayerId: 'p1',
            launchTime: -1,
            snapshotList: [],
            battleDataCurrent: {
                battleHash: 'not-matter',
                teams: [],
                characters: currentCharacters,
                players: [],
                spells: []
            },
            battleDataFuture: {
                battleHash: 'not-matter',
                teams: [],
                characters: [],
                players: [],
                spells: []
            },
            currentSpellAction: null,
            spellActionSnapshotList: []
        };

        const api: MiddlewareAPI = {
            dispatch: jest.fn(),
            getState: jest.fn()
        };

        const next = jest.fn();

        const action = SpellActionTimerEndAction({
            removed: false,
            correctHash: '',
            spellActionSnapshot: {} as any
        });

        snapshotMiddleware({
            extractState: () => initialState,
        })(api)(next)(action);

        expect(next).toHaveBeenNthCalledWith(1, action);
        expect(api.dispatch).not.toHaveBeenCalled();
    });

    it('should notify for deaths on spell action end action if there is new deaths', () => {

        const currentCharacters = [
            seedCharacter({
                period: 'current',
                id: '1'
            }),
            seedCharacter({
                period: 'current',
                id: '2'
            })
        ];

        const initialState: SnapshotState = {
            myPlayerId: 'p1',
            launchTime: -1,
            snapshotList: [],
            battleDataCurrent: {
                battleHash: 'not-matter',
                teams: [],
                characters: currentCharacters,
                players: [],
                spells: []
            },
            battleDataFuture: {
                battleHash: 'not-matter',
                teams: [],
                characters: [],
                players: [],
                spells: []
            },
            currentSpellAction: null,
            spellActionSnapshotList: []
        };

        const api: MiddlewareAPI = {
            dispatch: jest.fn(),
            getState: jest.fn()
        };

        const next = jest.fn((): any => {
            initialState.battleDataCurrent.characters[ 0 ].features.life = 0;
        });

        const action = SpellActionTimerEndAction({
            removed: false,
            correctHash: '',
            spellActionSnapshot: {} as any
        });

        snapshotMiddleware({
            extractState: () => initialState,
        })(api)(next)(action);

        expect(next).toHaveBeenNthCalledWith(1, action);
        expect(api.dispatch).toHaveBeenNthCalledWith(1, NotifyDeathsAction());
    });
});
