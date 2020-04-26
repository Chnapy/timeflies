import { ClientAction, DistributiveOmit } from '@timeflies/shared';
import { serviceNetwork } from '../../services/serviceNetwork';

type ClientActionWOSendTime<A extends ClientAction> = DistributiveOmit<A, 'sendTime'>;

type Params<A extends ClientAction> = {
    [ K in string ]: (...args) => ClientActionWOSendTime<A>;
};

type Return<P extends Params<A>, A extends ClientAction> = {
    [ K in keyof P ]: (...args: Parameters<P[ K ]>) => void;
};

export const useGameNetwork = <P extends Params<A>, A extends ClientAction>(map: P): Promise<Return<P, A>> => {

    return serviceNetwork<P, A>(map);
};
