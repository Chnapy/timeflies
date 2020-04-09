import { StoreTest } from '../../../../../StoreTest';
import { Position } from '@timeflies/shared';
import { seedCharacter } from '../../../entities/character/Character.seed';
import { MapManager } from '../../../map/MapManager';
import { seedMapManager } from '../../../map/MapManager.seed';
import { SpellPrepareMove } from './SpellPrepareMove';
import { BStateSpellLaunchAction } from '../../../battleState/BattleStateSchema';
import { SpellAction } from '../../../spellAction/SpellActionManager';

describe('# SpellPrepareMove', () => {

    const getMapManager = (pathAfterFirst: Position[] = []): [ MapManager, jest.Mock, Promise<Position[]> ] => {
        let pathPromise: Promise<Position[]>;
        const calculatePath = jest.fn(() => {
            pathPromise = new Promise<Position[]>(r => r([
                { x: -1, y: -1 },
                ...pathAfterFirst
            ]));
            return {
                cancel: () => true,
                promise: pathPromise
            };
        });

        return [ {
            ...seedMapManager('fake'),
            calculatePath
        }, calculatePath, pathPromise! ];
    };

    beforeEach(() => {
        StoreTest.beforeTest();
    });

    afterEach(() => {
        StoreTest.afterTest();
    });

    it('should not calculate path on tile hover if tile is obstacle', () => {

        const [ mapManager, calculatePath ] = getMapManager();

        const { defaultSpell } = seedCharacter('fake', {
            period: 'future',
            id: '1',
            seedSpells: [ { id: 's1', type: 'move' } ],
            player: null
        });

        const spellPrepareMove = SpellPrepareMove(defaultSpell, mapManager);

        spellPrepareMove.onTileHover({ x: 1, y: 1 }, 'obstacle');
        spellPrepareMove.onTileHover({ x: 1, y: 1 }, null);

        expect(calculatePath).not.toHaveBeenCalled();
    });

    it('should calculate path on tile hover, only once', () => {

        const [ mapManager, calculatePath ] = getMapManager();

        const { defaultSpell, position: charPosition } = seedCharacter('fake', {
            period: 'future',
            id: '1',
            seedSpells: [ { id: 's1', type: 'move' } ],
            player: null
        });

        const spellPrepareMove = SpellPrepareMove(defaultSpell, mapManager);

        spellPrepareMove.onTileHover({ x: 1, y: 1 }, 'default');

        expect(calculatePath).toHaveBeenNthCalledWith<[ Position, Position ]>(1,
            charPosition,
            { x: 1, y: 1 }
        );

        spellPrepareMove.onTileHover({ x: 1, y: 1 }, 'default');

        expect(calculatePath).toHaveBeenNthCalledWith<[ Position, Position ]>(1,
            charPosition,
            { x: 1, y: 1 }
        );
    });

    it('should not do anything on tile click if not hover before', () => {

        const [ mapManager ] = getMapManager();

        const { defaultSpell } = seedCharacter('fake', {
            period: 'future',
            id: '1',
            seedSpells: [ { id: 's1', type: 'move' } ],
            player: null
        });

        const spellPrepareMove = SpellPrepareMove(defaultSpell, mapManager);

        spellPrepareMove.onTileClick({ x: 1, y: 1 }, 'default');

        expect(StoreTest.getActions()).toHaveLength(0);
    });

    it('should dispatch action on tile click after hover', async () => {

        const expectedPath: Position[] = [
            { x: -1, y: 0 },
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 1, y: 1 },
        ];

        const [ mapManager, calculatePath, pathPromise ] = getMapManager(expectedPath);

        const { defaultSpell } = seedCharacter('fake', {
            period: 'future',
            id: '1',
            seedSpells: [ { id: 's1', type: 'move' } ],
            player: null
        });

        const spellPrepareMove = SpellPrepareMove(defaultSpell, mapManager);

        spellPrepareMove.onTileHover({ x: -1, y: -1 }, 'default');

        await pathPromise;

        spellPrepareMove.onTileClick({ x: -1, y: -1 }, 'default');

        expect(StoreTest.getActions()).toEqual<[ BStateSpellLaunchAction ]>([
            {
                type: 'battle/state/event',
                eventType: 'SPELL-LAUNCH',
                payload: {
                    spellActions: expectedPath.map((position): SpellAction => ({
                        spell: defaultSpell,
                        position
                    }))
                }
            }
        ]);
    });

});
