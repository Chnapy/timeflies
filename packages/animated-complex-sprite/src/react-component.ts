import { Cache } from '@timeflies/cache';
import { Spritesheet, Ticker } from 'pixi.js';
import { CustomPIXIComponent } from 'react-pixi-fiber';
import { AnimatedComplexSprite, FramesInfos, OutlineInfos, TexturesInfos } from './animated-complex-sprite';


export type AnimatedComplexSpriteProps = FramesInfos & Pick<AnimatedComplexSprite, 'onLoop' | 'onFrameChange'> & {
    spritesheet: Spritesheet;
    ticker?: Ticker;
    cache?: Cache<FramesInfos, TexturesInfos>;

    run?: boolean;
    keepTimeState?: boolean;

    outline?: OutlineInfos;
};

const extractFramesInfos = ({
    animationPath, pingPong, flip, framesDurations, framesOrder
}: FramesInfos): FramesInfos => ({
    animationPath, pingPong, flip, framesDurations, framesOrder
});

const getAnimatedComplexSpriteFromProps = ({
    spritesheet, ticker, cache, ...rest
}: AnimatedComplexSpriteProps) => new AnimatedComplexSprite(spritesheet, extractFramesInfos(rest), ticker, cache);

const applyAnimatedComplexSpriteProps = (
    sprite: AnimatedComplexSprite,
    oldProps: AnimatedComplexSpriteProps | undefined,
    newProps: AnimatedComplexSpriteProps
) => {
    const {
        onLoop, onFrameChange, run, keepTimeState, outline, ...rest
    } = newProps;

    sprite.setFramesInfos(extractFramesInfos(rest), { keepTimeState });

    sprite.setOutline(outline);

    if (run === false) {
        sprite.stop();
    } else {
        sprite.play();
    }

    sprite.onLoop = onLoop;
    sprite.onFrameChange = onFrameChange;
};

export const AnimatedComplexSpriteReact = CustomPIXIComponent<AnimatedComplexSprite, AnimatedComplexSpriteProps>(
    {
        customDisplayObject: getAnimatedComplexSpriteFromProps,
        customApplyProps: function (this: { applyDisplayObjectProps: (...args: any[]) => void }, sprite, oldProps, newProps) {
            applyAnimatedComplexSpriteProps(sprite, oldProps, newProps);

            this.applyDisplayObjectProps(oldProps, newProps);
        }
    },
    'AnimatedComplexSprite'
);
