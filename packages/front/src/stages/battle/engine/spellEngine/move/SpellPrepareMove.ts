import { Position, TileType } from '@timeflies/shared'
import { serviceDispatch } from '../../../../../services/serviceDispatch'
import { BStateSpellLaunchAction } from '../../../battleState/BattleStateSchema'
import { Spell } from '../../../entities/Spell'
import { MapManager } from '../../../map/MapManager'
import { SpellAction } from '../../../spellAction/SpellActionManager'
import { SpellPrepareSubEngineCreator } from '../../SpellPrepareEngine'

// interface Dependencies {
//     graphics: typeof SpellGraphicMove;
// }

export const spellLaunchMove = ({ spell, position }: SpellAction) => {
    const { character } = spell;

    character.set({ position });
};

export const SpellPrepareMove: SpellPrepareSubEngineCreator = (
    spell: Spell,
    mapManager: MapManager,
    // { graphics }: Dependencies = { graphics: SpellGraphicMove }
) => {

    const { character } = spell;

    character.set({
        state: 'idle'
    });

    // let pathWorld: Position[] = [];
    let pathTile: Position[] = [];

    let currentTile: { x: number; y: number; } | null = null;
    let previousTile: { x: number; y: number; } | null = null;

    const { dispatchSpellLaunch } = serviceDispatch({
        dispatchSpellLaunch: (spellActions: SpellAction[]): BStateSpellLaunchAction => ({
            type: 'battle/state/event',
            eventType: 'SPELL-LAUNCH',
            payload: {
                spellActions
            }
        })
    });

    return {
        onTileHover(tilePos: Position, tileType: TileType) {

            currentTile = tileType === 'default' ? tilePos : null;
            if (currentTile) {

                if (previousTile
                    && currentTile.x === previousTile.x && currentTile.y === previousTile.y) {
                    return;
                }

                const mainPos = character.position;

                const pathPromise = mapManager.calculatePath(mainPos, currentTile);

                pathPromise.promise.then(path => {
                    pathTile = path;
                    // pathWorld = path.map(p => mapManager.tileToWorld(p, true));
                });

                previousTile = currentTile;
            }
        },
        onTileClick() {
            if (!currentTile
                || !pathTile.length) {
                return;
            }

            const positions = pathTile.slice(1);

            dispatchSpellLaunch(positions.map((position): SpellAction => ({
                spell,
                position
            })));
        },
        stop() {
        }
    }
}