import { ClientAction, DistributiveOmit } from '@timeflies/shared';
import { Controller } from '../../Controller';

type ClientActionWOSendTime<A extends ClientAction> = DistributiveOmit<A, 'sendTime'>;

type Params<A extends ClientAction> = {
    [ K in string ]: (...args) => ClientActionWOSendTime<A>;
};

type Return<P extends Params<A>, A extends ClientAction> = {
    [ K in keyof P ]: (...args: Parameters<P[ K ]>) => Promise<void>;
};

export const useGameNetwork = <P extends Params<A>, A extends ClientAction>(map: P): Return<P, A> => {


    const { actionManager } = Controller;

    return Object.entries(map)
        .reduce((arr, [ key, value ]) => {

            arr[ key ] = async (...args) => {

                // TODO do the same in serviceNetwork

                await Controller.waitConnect();

                actionManager.dispatch({
                    type: 'message/send',
                    message: value(...args)
                });
            };

            return arr;
        }, {}) as Return<P, A>;
};
