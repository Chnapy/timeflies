import { assertIsDefined, CharacterType, Orientation, getOrientationFromTo } from '@timeflies/shared';
import * as PIXI from 'pixi.js';
import { shallowEqual } from 'react-redux';
import { CanvasContext } from '../../../../../canvas/CanvasContext';
import { BattleDataPeriod } from '../../../snapshot/battle-data';
import { getBattleData } from '../../../snapshot/snapshot-reducer';

export interface CharacterSpriteProps {
    characterType: CharacterType;
    characterState: CharacterSpriteState;
    orientation: Orientation;
}

export type CharacterSpriteMutableProps = Pick<CharacterSpriteProps,
    | 'characterState'
    | 'orientation'
>;

export type CharacterSpriteState = 'idle' | 'walk';

export const getAnimPath = (
    type: CharacterType,
    state: CharacterSpriteState,
    orientation: Orientation
) => `${type}/${state}/${orientation}/${type}_${state}_${orientation}`;

const getTextures = (
    spritesheet: PIXI.Spritesheet,
    { characterType, characterState, orientation }: CharacterSpriteProps
): PIXI.Texture[] => {

    const path = getAnimPath(characterType, characterState, orientation);
    const textures = spritesheet.animations[ path ];
    assertIsDefined(textures);

    return textures;
};

export const CharacterSprite = class extends PIXI.AnimatedSprite {

    constructor(characterId: string, period: BattleDataPeriod) {
        super([ PIXI.Texture.EMPTY ]);

        const { storeEmitter, spritesheets } = CanvasContext.consumer('storeEmitter', 'spritesheets');

        storeEmitter.onStateChange(
            ({ battle }) => {
                const { snapshotState, } = battle;
                const character = getBattleData(snapshotState, period).characters.find(c => c.id === characterId)!;

                const { currentSpellAction, battleDataFuture } = snapshotState;

                if (currentSpellAction && currentSpellAction.characterId === characterId) {
                    const spell = battleDataFuture.spells.find(s => s.id === currentSpellAction.spellId)!;

                    const spriteState: CharacterSpriteState = spell.staticData.type === 'move' ? 'walk' : 'idle'

                    return {
                        type: character.staticData.type,
                        orientation: getOrientationFromTo(character.position, currentSpellAction.position),
                        spriteState
                    };
                }
                
                return {
                    type: character.staticData.type,
                    orientation: character.orientation,
                    spriteState: 'idle' as CharacterSpriteState
                };
            },
            ({ type, orientation, spriteState }) => {
                this.textures = getTextures(spritesheets.characters, {
                    characterType: type,
                    characterState: spriteState,
                    orientation
                });
                this.play();
            },
            shallowEqual
        );
    }
};
