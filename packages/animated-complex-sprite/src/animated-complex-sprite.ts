import { Cache, createCache } from '@timeflies/cache';
import { Sprite, Spritesheet, Texture, Ticker } from 'pixi.js';
import { createTickerManager, TickerManager } from './ticker-manager';


export type FlipInfos = {
    direction: 'horizontal' | 'vertical';
    baseFramesInfos: FramesInfos;
};

export type FramesInfos = {
    animationPath: string;
    pingPong: boolean;
    framesOrder?: number[];
    flip?: FlipInfos;
    framesDurations: number[];
};

type Animations = {
    [ path: string ]: Texture[];
};

type TimedTexture = {
    texture: Texture;
    duration: number;
    textureIndex: number;
};

export type TexturesInfos = {
    timedTextures: TimedTexture[];
    tickerInterval: number;
    previousFrame: number;
};

const objectDeepEqual = (objA: any, objB: any): boolean => {
    if (objA === objB) {
        return true;
    }

    if (objA && objB && typeof objA === 'object' && typeof objB === 'object') {

        const keysA = Object.keys(objA);
        const keysB = Object.keys(objB);

        return keysA.length === keysB.length
            && keysA.every(key => objectDeepEqual(objA[ key ], objB[ key ]));
    }

    return false;
};

export class AnimatedComplexSprite extends Sprite {

    static durationToInterval = (duration: number) => duration / 3;

    private framesInfos: FramesInfos;

    private animations: Animations;
    private timedTextures: TimedTexture[];

    onLoop?: () => void;
    onFrameChange?: (currentFrame: number, textureIndex: number) => void;

    private previousFrame: number;
    private currentTime: number;

    private readonly tickerManager: TickerManager;
    private tickerInterval: number;

    private readonly cache: Cache<FramesInfos, TexturesInfos>;

    constructor(
        spritesheet: Spritesheet,
        framesInfos: FramesInfos,
        ticker?: Ticker,
        cache: Cache<FramesInfos, TexturesInfos> = createCache()
    ) {
        super();

        this.animations = spritesheet.animations;
        this.framesInfos = framesInfos;

        this.currentTime = 0;

        this.tickerManager = createTickerManager(
            this.update.bind(this),
            () => this.tickerInterval,
            ticker
        );

        this.cache = cache;

        const { timedTextures, tickerInterval, previousFrame } = this.getTexturesInfos();
        this.timedTextures = timedTextures;
        this.tickerInterval = tickerInterval;
        this.previousFrame = previousFrame;

        this.updateTexture(true);
    }

    private getTimedTextures(rawTextures: Texture[], framesOrder: number[], framesDurations: number[], pingPong: boolean) {

        const framedTextures = framesOrder.map(index => rawTextures[ index - 1 ])
            .map((texture, frame) => ({
                texture,
                frame,
                textureIndex: framesOrder[ frame ]
            }));

        if (pingPong && framedTextures.length > 2) {
            framedTextures.push(
                ...framedTextures.slice(1, framedTextures.length - 1).reverse()
            );
        }

        return framedTextures.map(({ texture, frame, textureIndex }): TimedTexture => ({
            texture,
            duration: framesDurations[ frame % framesDurations.length ],
            textureIndex
        }));
    }

    private getCurrentFrame(): number {
        let currentFrame = Math.floor(this.currentTime) % this.timedTextures.length;

        if (currentFrame < 0) {
            currentFrame += this.timedTextures.length;
        }

        return currentFrame;
    }

    private getFinalFramesInfos() {
        const {
            flip,
            ...restInfos
        } = this.framesInfos;

        if (flip) {
            const { flip: innerFlip, ...flipFramesInfos } = flip.baseFramesInfos;

            if (innerFlip) {
                throw new Error('Cannot use flip baseState also flipped');
            }

            return {
                ...flipFramesInfos,
                textureFlipFn: (texture: Texture) => {
                    const flippedTexture = texture.clone();
                    flippedTexture.rotate = flip.direction === 'horizontal' ? 12 : 8;
                    return flippedTexture;
                },
            };
        }

        return {
            ...restInfos,
            textureFlipFn: (texture: Texture) => texture,
        };
    }

    private getTexturesInfos(): TexturesInfos {
        return this.cache.getOrElse(this.framesInfos, () => {

            const {
                animationPath,
                pingPong = false,
                framesOrder: rawFramesOrder,
                framesDurations,
                textureFlipFn
            } = this.getFinalFramesInfos();

            const rawTextures = this.animations[ animationPath ];

            if (!rawTextures || !rawTextures.length) {
                throw new Error(`Textures not found with animation path [${animationPath}]`);
            }

            const textures = rawTextures.map(textureFlipFn);

            const framesOrder = rawFramesOrder ?? textures.map((t, i) => i + 1);

            const timedTextures = this.getTimedTextures(textures, framesOrder, framesDurations, pingPong);
            const tickerInterval = AnimatedComplexSprite.durationToInterval(Math.min(...timedTextures.map(t => t.duration)));

            const infos = {
                timedTextures,
                tickerInterval,
                previousFrame: 0
            };

            return infos;
        });
    }

    setFramesInfos(newFramesInfos: FramesInfos, options: {
        forceUpdate?: boolean;
        keepTimeState?: boolean;
    } = {}) {
        const {
            forceUpdate = false,
            keepTimeState = false,
        } = options;

        if (!forceUpdate && objectDeepEqual(this.framesInfos, newFramesInfos)) {
            return;
        }

        this.framesInfos = newFramesInfos;

        const { timedTextures, tickerInterval, previousFrame } = this.getTexturesInfos();

        this.timedTextures = timedTextures;
        this.tickerInterval = tickerInterval;
        this.previousFrame = previousFrame;
        if (!keepTimeState) {
            this.currentTime = 0;
        }

        this.tickerManager.resetDeltaMsSum();

        this.updateTexture(true);
    }

    play() {
        this.tickerManager.start();
    }

    private getCurrentDuration(): number {
        return this.timedTextures[ this.getCurrentFrame() ].duration;
    }

    private update(deltaMs: number): void {
        const previousFrame = this.getCurrentFrame();

        let lag = this.currentTime % 1 * this.getCurrentDuration();

        lag += deltaMs;

        while (lag < 0) {
            this.currentTime--;
            lag += this.getCurrentDuration();
        }

        const sign = Math.sign(deltaMs);

        this.currentTime = Math.floor(this.currentTime);

        while (lag >= this.getCurrentDuration()) {
            lag -= this.getCurrentDuration() * sign;
            this.currentTime += sign;
        }

        this.currentTime += lag / this.getCurrentDuration();

        if (previousFrame !== this.getCurrentFrame()) {

            if (this.onLoop && previousFrame === this.timedTextures.length - 1) {
                this.onLoop();
            }

            this.updateTexture();
        }
    }

    private updateTexture(force?: boolean) {
        const currentFrame = this.getCurrentFrame();

        if (!force && this.previousFrame === currentFrame) {
            return;
        }

        this.previousFrame = currentFrame;

        this.texture = this.timedTextures[ currentFrame ].texture;
        this._cachedTint = 0xFFFFFF;

        if (this.onFrameChange) {
            this.onFrameChange(currentFrame, this.timedTextures[ currentFrame ].textureIndex);
        }
    }

    stop() {
        this.tickerManager.stop();
    }

    clearCache() {
        this.cache?.clear();
    }

    destroy(...args: Parameters<Sprite[ 'destroy' ]>) {
        this.stop();
        this.clearCache();
        super.destroy(...args);

        delete this.onLoop;
        delete this.onFrameChange;
    }
}
