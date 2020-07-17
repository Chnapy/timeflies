import * as PIXI from 'pixi.js';
import { AssetLoader } from '../assetManager/AssetLoader';
import { TiledMapGraphic } from '../stages/battle/graphic/tiledMap/TiledMapGraphic';
import { ViewportListener } from '../stages/battle/graphic/viewport-listener';
import { StoreEmitter } from '../store/store-manager';

export interface CanvasContextMap {
    readonly storeEmitter: StoreEmitter;
    readonly assetLoader: AssetLoader;
    readonly viewportListener: ViewportListener;
    readonly tiledMapGraphic: TiledMapGraphic;
    readonly spritesheets: {
        readonly characters: PIXI.Spritesheet;
    };
}

export type CanvasContextKey = keyof CanvasContextMap;

const assertContextIsPresent = (providerMap: Partial<CanvasContextMap>, consumerKeys: CanvasContextKey[]): void | never => {
    if (consumerKeys.some(k => providerMap[ k ] === undefined)) {
        throw new Error(`Consumer expects provider map with keys:${consumerKeys} but got ${Object.keys(providerMap)}`);
    }
};

const contextsBuffer: Map<number, Partial<CanvasContextMap>> = new Map();

export const CanvasContext = {

    provider: <K extends CanvasContextKey, R>(contextMap: { [ key in K ]: CanvasContextMap[ key ] }, fn: () => R): R => {
        const id = Math.random();

        contextsBuffer.set(id, contextMap);

        const ret = fn();

        if (ret instanceof Promise) {
            return ret.then(payload => {
                contextsBuffer.delete(id);

                return payload;
            }) as unknown as R;
        } else {
            contextsBuffer.delete(id);
        };

        return ret;
    },

    consumer: <K extends CanvasContextKey>(...keys: K[]): Pick<CanvasContextMap, K> => {
        const o: Pick<CanvasContextMap, K> = Object.assign({}, ...Array.from(contextsBuffer.values()));
        assertContextIsPresent(o, keys);

        return o;
    }

};
