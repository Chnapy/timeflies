import { Message } from '@timeflies/socket-messages';
import { Service } from '../service';
import { createFakeGlobalEntitiesNoService, createFakeSocketCell } from '../service-test-utils';

export const getFakeRoomListEntities = <S extends { new(...args: any[]): Service }>(serviceCreator: S) => {
    const socketCellP1 = createFakeSocketCell();
    const socketCellP2 = createFakeSocketCell();
    const socketCellP3 = createFakeSocketCell();
    const globalEntities = createFakeGlobalEntitiesNoService();
    const service = new serviceCreator(globalEntities);

    const connectSocket = () => {
        service.onSocketConnect(socketCellP1, 'p1');
        service.onSocketConnect(socketCellP2, 'p2');
        service.onSocketConnect(socketCellP3, 'p3');
    };

    const expectEveryPlayersReceived = <M extends Message<any>>(message: M) => {
        expect(socketCellP1.send).toHaveBeenCalledWith(message);
        expect(socketCellP2.send).toHaveBeenCalledWith(message);
        expect(socketCellP3.send).toHaveBeenCalledWith(message);
    };

    return { socketCellP1, socketCellP2, globalEntities, service, connectSocket, expectEveryPlayersReceived };
};
