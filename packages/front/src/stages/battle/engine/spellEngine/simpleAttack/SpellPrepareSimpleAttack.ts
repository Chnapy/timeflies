import { equals, Position, TileType } from '@timeflies/shared'
import { serviceBattleData } from '../../../../../services/serviceBattleData'
import { serviceDispatch } from '../../../../../services/serviceDispatch'
import { BStateSpellLaunchAction } from '../../../battleState/BattleStateSchema'
import { Character } from '../../../entities/character/Character'
import { Spell } from '../../../entities/spell/Spell'
import { MapManager } from '../../../map/MapManager'
import { SpellAction } from '../../../spellAction/SpellActionManager'
import { SpellPrepareSubEngineCreator } from '../../SpellPrepareEngine'

export const spellLaunchSimpleAttack = ({ actionArea }: SpellAction, characterList: Character<'future'>[]) => {

    const targets = characterList.filter(c => actionArea.some(p => equals(p)(c.position)));

    targets.forEach(t => t.alterLife(-50));
};

export const SpellPrepareSimpleAttack: SpellPrepareSubEngineCreator<
    undefined | { actionArea: Position[] }
> = (
    spell: Spell<'future'>,
    mapManager: MapManager,
    ) => {

        const { characters } = serviceBattleData('future');

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

        const rangeArea: Position[] = mapManager.getRangeArea(
            character.position,
            spell.feature.area,
            characters.map(c => c.position)
        );

        return {

            getRangeArea() {
                return rangeArea;
            },

            async onTileHover(tilePos: Position, tileType: TileType) {

                const isInArea = rangeArea.some(equals(tilePos));
                if (!isInArea) {
                    return;
                }

                const actionArea = tiledManager.getArea(tilePos, 1);

                return {
                    actionArea
                };
            },
            async onTileClick(tilePos: Position, tileType: TileType) {

                const isInArea = rangeArea.some(equals(tilePos));
                if (!isInArea) {
                    return;
                }

                const actionArea = tiledManager.getArea(tilePos, 1);

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
