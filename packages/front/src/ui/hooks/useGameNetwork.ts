import { ClientAction, DistributiveOmit } from '@timeflies/shared';
import { useDispatch } from 'react-redux';
import { SendMessageAction } from '../../socket/wsclient-actions';

type ClientActionWOSendTime<A extends ClientAction> = DistributiveOmit<A, 'sendTime'>;

type Params<A extends ClientAction> = {
    [ K in string ]: (...args) => ClientActionWOSendTime<A>;
};

type Return<P extends Params<A>, A extends ClientAction> = {
    [ K in keyof P ]: (...args: Parameters<P[ K ]>) => void;
};

export const useGameNetwork = <P extends Params<A>, A extends ClientAction>(map: P): Return<P, A> => {

    const dispatch = useDispatch();

    return Object.entries(map)
        .reduce((arr, [ key, value ]) => {

            arr[ key ] = (...args) => {
                return dispatch(SendMessageAction(value(...args)));
            };

            return arr;
        }, {}) as Return<P, A>;
};
