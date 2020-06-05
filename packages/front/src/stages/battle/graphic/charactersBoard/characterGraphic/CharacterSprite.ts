import { assertIsDefined, CharacterType, Orientation } from '@timeflies/shared';
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
            state => {
                const { staticData, orientation } = getBattleData(state.battle.snapshotState, period).characters.find(c => c.id === characterId)!;

                const spriteState: CharacterSpriteState = 'idle';   // TODO

                return {
                    type: staticData.type,
                    orientation,
                    spriteState
                };
            },
            ({ type, orientation, spriteState }) => {
                this.textures = getTextures(spritesheets.characters, {
                    characterType: type,
                    characterState: spriteState,
                    orientation
                });
            },
            shallowEqual
        );
    }
};
