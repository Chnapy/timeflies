import { GameAction } from '../../action/GameAction';
import { GameEngine } from '../GameEngine';
import { Controller } from '../../Controller';
import { Action } from 'redux';

export interface ConnectedSceneConfig<K extends string> extends Omit<Phaser.Types.Scenes.SettingsConfig, 'key'> {
    key: K;
}

type NarrowAction<T, N> = T extends Action<N> ? T : never;

export abstract class ConnectedScene<K extends string, D extends {} | undefined = undefined> extends Phaser.Scene {

    readonly key: K;
    initData!: D;
    protected readonly reducerMap: {
        [ K in GameAction[ 'type' ] ]?: (action?: NarrowAction<GameAction, K>) => void;
    };

    constructor(config: K | ConnectedSceneConfig<K>) {
        super(config);
        this.key = typeof config === 'string' ? config : config.key;
        this.reducerMap = {};
    }

    init(data: D): void {
        this.initData = data;

        Object.keys(this.reducerMap).forEach(type => {
            this.events.on(type, this.reducerMap[ type ], this);
        });
    }

    abstract preload(): void;

    abstract create(data: D): void;

    abstract update(time: number, delta: number): void;

    start<S extends ConnectedScene<any, any>>(
        key: S[ 'key' ],
        data: S[ 'initData' ]): Phaser.Scenes.ScenePlugin {
        return this.scene.start(key, data);
    }

    protected readonly dispatch = <A extends GameAction>(action: A): void => {
        Controller.dispatch(action);
    }

    protected readonly reduce = <A extends GameAction>(type: A[ 'type' ], fn: (action: A) => void) => {

        if (this.reducerMap[ type ]) {
            console.warn('reducer already exist for type', type,
                'old reducer:', this.reducerMap[ type ],
                'new reducer:', fn);
        }

        this.reducerMap[ type ] = fn as any;

        if (this.events)
            this.events.on(type, fn, this);

        return fn;
    }
}
