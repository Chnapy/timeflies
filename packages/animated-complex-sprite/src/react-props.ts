import { Spritesheet, Ticker } from 'pixi.js';
import { AnimatedComplexSprite, FramesInfosGetter, TexturesInfos } from './animated-complex-sprite';
import { Cache } from './cache';

type AnimatedComplexSpritePrimaryProps<S> = {
    spritesheet: Spritesheet;
    getFramesInfos: FramesInfosGetter<S>;
    state: S;
    ticker?: Ticker;
    cache: Cache<S, TexturesInfos>;
};

type AnimatedComplexSpriteSecondaryProps = {
    run?: boolean;
};

export type AnimatedComplexSpriteProps<S = any> = AnimatedComplexSpritePrimaryProps<S>
    & AnimatedComplexSpriteSecondaryProps;

const denyUpdateProps = <P, K extends keyof P>(oldProps: P, newProps: P, ...keys: K[]): Omit<P, K> => {
    const unexpectedPropsChanges = keys.filter(key => oldProps[ key ] !== newProps[ key ]);
    if (unexpectedPropsChanges.length) {
        throw new Error(`Unexpected props change. These props should NOT change: ${unexpectedPropsChanges.join(', ')}`);
    }
    return newProps;
};

export const getAnimatedComplexSpriteFromProps = ({
    spritesheet, getFramesInfos, state, ticker, cache, run
}: AnimatedComplexSpriteProps) => {

    const sprite = new AnimatedComplexSprite(spritesheet, getFramesInfos, state, ticker, cache);

    if (run) {
        sprite.play();
    } else if (run === false) {
        sprite.stop();
    }

    return sprite;
};

export const applyAnimayedComplexSpriteProps = (
    sprite: AnimatedComplexSprite,
    oldProps: AnimatedComplexSpriteProps,
    newProps: AnimatedComplexSpriteProps
) => {
    const { state, run } = denyUpdateProps(oldProps, newProps, 'spritesheet', 'getFramesInfos', 'ticker', 'cache');

    sprite.setState(state);

    if(run) {
        sprite.play();
    } else if(run === false) {
        sprite.stop();
    }
};
