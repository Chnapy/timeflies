import { Position, TileType, getOrientationFromTo } from '@timeflies/shared'
import { serviceDispatch } from '../../../../../services/serviceDispatch'
import { BStateSpellLaunchAction } from '../../../battleState/BattleStateSchema'
import { Spell } from '../../../entities/spell/Spell'
import { MapManager } from '../../../map/MapManager'
import { SpellAction } from '../../../spellAction/SpellActionManager'
import { SpellPrepareSubEngineCreator } from '../../SpellPrepareEngine'

export const spellLaunchMove = ({ spell, position }: SpellAction) => {
    const { character } = spell;

    const orientation = getOrientationFromTo(character.position, position);

    character.set({ position, orientation });
};

export const SpellPrepareMove: SpellPrepareSubEngineCreator<
    { path: Position[] } | undefined
> = (
    spell: Spell<'future'>,
    mapManager: MapManager,
    ) => {

        const { character } = spell;

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
            async onTileHover(tilePos: Position, tileType: TileType) {

                currentTile = tileType === 'default' ? tilePos : null;
                if (currentTile) {

                    if (previousTile
                        && currentTile.x === previousTile.x && currentTile.y === previousTile.y) {
                        return;
                    }

                    const mainPos = character.position;

                    const { promise } = mapManager.calculatePath(mainPos, currentTile);

                    previousTile = currentTile;

                    pathTile = await promise;

                    return {
                        path: pathTile
                    };
                }
                previousTile = null;
            },
            async onTileClick() {
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
    };
