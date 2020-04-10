import { Position, TileType, equals } from '@timeflies/shared'
import { Spell } from '../../../entities/spell/Spell'
import { MapManager } from '../../../map/MapManager'
import { SpellAction } from '../../../spellAction/SpellActionManager'
import { SpellPrepareSubEngineCreator } from '../../SpellPrepareEngine'
import { serviceDispatch } from '../../../../../services/serviceDispatch'
import { BStateSpellLaunchAction } from '../../../battleState/BattleStateSchema'
import { Character } from '../../../entities/character/Character'

export const spellLaunchSimpleAttack = ({ actionArea }: SpellAction, characterList: Character<'future'>[]) => {

    const targets = characterList.filter(c => actionArea.some(p => equals(p)(c.position)));

    targets.forEach(t => t.alterLife(-10));
};

export const SpellPrepareSimpleAttack: SpellPrepareSubEngineCreator<
    undefined | { actionArea: Position[] }
> = (
    spell: Spell<'future'>,
    mapManager: MapManager,
    ) => {

        const { dispatchSpellLaunch } = serviceDispatch({
            dispatchSpellLaunch: (spellActions: SpellAction[]): BStateSpellLaunchAction => ({
                type: 'battle/state/event',
                eventType: 'SPELL-LAUNCH',
                payload: {
                    spellActions
                }
            })
        });

        const { character } = spell;
        const { tiledManager } = mapManager;

        const rangeArea: Position[] = tiledManager.getRangeArea(character.position, spell.feature.area);

        return {

            getRangeArea() {
                return rangeArea;
            },

            async onTileHover(tilePos: Position, tileType: TileType) {

                const isInArea = rangeArea.some(equals(tilePos));
                if (!isInArea) {
                    return;
                }

                const actionArea = tiledManager.getActionArea(tilePos, 1);

                return {
                    actionArea
                };
            },
            async onTileClick(tilePos: Position, tileType: TileType) {

                const isInArea = rangeArea.some(equals(tilePos));
                if (!isInArea) {
                    return;
                }

                const actionArea = tiledManager.getActionArea(tilePos, 1);

                const spellAction: SpellAction = {
                    spell,
                    position: tilePos,
                    actionArea
                };

                dispatchSpellLaunch([ spellAction ]);
            },
            stop() {
            }
        }
    };
