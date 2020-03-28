import { MapManager } from '../stages/battle/map/MapManager';
import { ActionManager } from '../action/ActionManager';

export interface CanvasContextMap {
    readonly mapManager: MapManager;
    readonly actionManager: ActionManager;
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

        contextsBuffer.delete(id);

        return ret;
    },

    consumer: <K extends CanvasContextKey>(...keys: K[]): Pick<CanvasContextMap, K> => {
        const o: Pick<CanvasContextMap, K> = Object.assign({}, ...Array.from(contextsBuffer.values()));
        assertContextIsPresent(o, keys);

        return o;
    }

};
