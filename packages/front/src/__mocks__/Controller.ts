import { GameAction } from "../action/GameAction";
import { IController } from "../IController";
import { StoreTest } from '../StoreTest';

export const Controller: IController = {

    start() { },

    getStore() {
        return StoreTest.getStore();
    },

    waitConnect() {
        return Promise.resolve();
    },

    dispatch<A extends GameAction>(action: A): void {
        StoreTest.getStore().dispatch(action);
    },

    addEventListener<A extends GameAction>(type, fn) {
        StoreTest.getStore().subscribe(() => {
            const actions = StoreTest.getStore().getActions();
            const lastAction: GameAction | A | undefined = actions[ actions.length - 1 ];
            if (lastAction?.type === type) {
                fn(lastAction);
            }
        });
    },

    loader: {
        newInstance() {
            const this_ = {
                _keys: [] as string[],
                add(key, path) { this_._keys.push(key); return this_ as any },
                addMultiple(o) { this_._keys.push(...Object.keys(o)); return this_ as any },
                load() {
                    return Promise.resolve(
                        this_._keys.reduce<{}>((o, k) => {
                            o[ k ] = k;
                            return o;
                        }, {})
                    );
                }
            };
            return this_;
        }
    }
};
