import { Spritesheet, Ticker } from 'pixi.js';
import { AnimatedComplexSprite, FramesInfosGetter, TexturesInfos } from './animated-complex-sprite';
import { Cache } from './cache';

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

const denyUpdateProps = <P, K extends keyof P>(oldProps: P, newProps: P, ...keys: K[]) => {
    const unexpectedPropsChanges = keys.filter(key => oldProps[ key ] !== newProps[ key ]);
    if (unexpectedPropsChanges.length) {
        throw new Error(`Unexpected props change. These props should NOT change: ${unexpectedPropsChanges.join(', ')}`);
    }
};

export const getAnimatedComplexSpriteFromProps = ({
    spritesheet, getFramesInfos, state, ticker, cache
}: AnimatedComplexSpriteProps) => new AnimatedComplexSprite(spritesheet, getFramesInfos, state, ticker, cache);

export const applyAnimayedComplexSpriteProps = (
    sprite: AnimatedComplexSprite,
    oldProps: AnimatedComplexSpriteProps | undefined,
    newProps: AnimatedComplexSpriteProps
) => {
    if (oldProps) {
        denyUpdateProps(oldProps, newProps, 'spritesheet', 'getFramesInfos', 'ticker', 'cache');
    }
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
