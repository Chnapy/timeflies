import { PlayerId } from '@timeflies/common';
import { SocketCell } from '@timeflies/socket-server';
import { GlobalEntitiesNoServices } from '../main/global-entities';

export type Service = {
    onSocketConnect: (socketCell: SocketCell, currentPlayerId: PlayerId) => void;
};
export type CreateServiceFunction<S extends Service> = (globalEntitiesNoServices: GlobalEntitiesNoServices) => S;

export const createService = <S extends Service>(createFunction: CreateServiceFunction<S>) => createFunction;
