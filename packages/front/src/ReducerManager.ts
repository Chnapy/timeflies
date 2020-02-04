import { Action } from 'redux';
import { GameAction } from './action/GameAction';

type NarrowAction<T, N> = T extends Action<N> ? T : never;

export abstract class ReducerManager<S extends Phaser.Scene> {

    protected readonly reducerMap: {
        [ K in GameAction[ 'type' ] ]?: (action?: NarrowAction<GameAction, K>) => void;
    } = {};

    constructor(
        protected readonly scene: S
    ) {}

    protected readonly reduce = <A extends GameAction>(type: A[ 'type' ], fn: (action: A) => void) => {

        if (this.reducerMap[ type ]) {
            console.warn('reducer already exist for type', type,
                'old reducer:', this.reducerMap[ type ],
                'new reducer:', fn);
        }

        this.reducerMap[ type ] = fn as any;

        if (this.scene.events) {
            this.scene.events.on(type, fn, this);
        } else {
            throw new Error('Scene EventEmitter doesn\'t exist yet');
        }

        return fn;
    }

    removeAllReducers(): void {
        Object.keys(this.reducerMap).forEach(type => {
            this.scene.events.removeListener(type, this.reducerMap[ type ], this);
        });
    }
}