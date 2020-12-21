import { Cache } from '@timeflies/cache';
import { Spritesheet, Ticker } from 'pixi.js';
import { CustomPIXIComponent } from 'react-pixi-fiber';
import { AnimatedComplexSprite, FramesInfosGetter, TexturesInfos } from './animated-complex-sprite';

type AnimatedComplexSpritePrimaryProps<S> = {
    spritesheet: Spritesheet;
    getFramesInfos: FramesInfosGetter<S>;
    state: S;
    ticker?: Ticker;
    cache?: Cache<S, TexturesInfos>;
};

type AnimatedComplexSpriteSecondaryProps<S> = Pick<AnimatedComplexSprite<S>, 'onLoop' | 'onFrameChange'> & {
    run?: boolean;
    keepTimeState?: boolean;
};

export type AnimatedComplexSpriteProps<S = any> = AnimatedComplexSpritePrimaryProps<S>
    & AnimatedComplexSpriteSecondaryProps<S>;

const getAnimatedComplexSpriteFromProps = ({
    spritesheet, getFramesInfos, state, ticker, cache
}: AnimatedComplexSpriteProps) => new AnimatedComplexSprite(spritesheet, getFramesInfos, state, ticker, cache);

const applyAnimatedComplexSpriteProps = (
    sprite: AnimatedComplexSprite,
    oldProps: AnimatedComplexSpriteProps | undefined,
    newProps: AnimatedComplexSpriteProps
) => {
    const { state, onLoop, onFrameChange, run, keepTimeState } = newProps;

    sprite.setState(state, {
        keepTimeState
    });

    if (run === false) {
        sprite.stop();
    } else {
        sprite.play();
    }

    sprite.onLoop = onLoop;
    sprite.onFrameChange = onFrameChange;
};

export const AnimatedComplexSpriteReact = CustomPIXIComponent<AnimatedComplexSprite<any>, AnimatedComplexSpriteProps<any>>(
    {
        customDisplayObject: getAnimatedComplexSpriteFromProps,
        customApplyProps: function (this: { applyDisplayObjectProps: (...args: any[]) => void }, sprite, oldProps, newProps) {
            applyAnimatedComplexSpriteProps(sprite, oldProps, newProps);

            this.applyDisplayObjectProps(oldProps, newProps);
        }
    },
    'AnimatedComplexSprite'
);
