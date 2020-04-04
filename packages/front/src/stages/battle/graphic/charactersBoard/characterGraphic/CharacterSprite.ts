import { CharacterType, Orientation, assertIsDefined } from '@timeflies/shared';
import * as PIXI from 'pixi.js';

export interface CharacterSpriteProps {
    readonly characterType: CharacterType;
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

    private readonly spritesheet: PIXI.Spritesheet;
    private readonly props: CharacterSpriteProps;

    constructor(spritesheet: PIXI.Spritesheet, initialProps: CharacterSpriteProps) {
        super(getTextures(spritesheet, initialProps));
        this.spritesheet = spritesheet;
        this.props = { ...initialProps };
    }

    setProps(props: Partial<CharacterSpriteMutableProps>): this {
        if (props.characterState) {
            this.props.characterState = props.characterState;
        }
        if (props.orientation) {
            this.props.orientation = props.orientation;
        }
        this.textures = this.getTextures();
        return this;
    }

    private getTextures(): PIXI.Texture[] {
        return getTextures(this.spritesheet, this.props);
    }
};
