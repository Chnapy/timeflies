import { ClientAction, DistributiveOmit } from "@timeflies/shared";
import { Controller } from "../Controller";

type ClientActionWOSendTime<A extends ClientAction> = DistributiveOmit<A, 'sendTime'>;

type Params<A extends ClientAction> = {
    [ K in string ]: (...args) => ClientActionWOSendTime<A>;
};

type Return<P extends Params<A>, A extends ClientAction> = {
    [ K in keyof P ]: (...args: Parameters<P[ K ]>) => Promise<void>;
};

export const serviceNetwork = async <P extends Params<A>, A extends ClientAction>(map: P): Promise<Return<P, A>> => {

    const { dispatch } = Controller.getStore();

    await Controller.waitConnect();

    return Object.entries(map)
        .reduce((arr, [ key, value ]) => {

            arr[ key ] = (...args) => dispatch({
                type: 'message/send',
                message: value(...args)
            });

            return arr;
        }, {}) as Return<P, A>;
};
