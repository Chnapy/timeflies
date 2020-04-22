import { Dispatch } from 'react';
import { useDispatch } from 'react-redux';
import { GameAction } from '../../action/GameAction';
import { SendMessageAction } from '../../socket/WSClient';

type Params = {
    [ K in string ]: (...args) => Exclude<GameAction, SendMessageAction>;
};

export const useGameDispatch = <P extends Params>(map: P): P => {

    const dispatch = useDispatch<Dispatch<GameAction>>();

    return Object.entries(map)
        .reduce((arr, [ key, value ]) => {

            arr[ key ] = (...args) => dispatch(value(...args));

            return arr;
        }, {}) as P;
};
