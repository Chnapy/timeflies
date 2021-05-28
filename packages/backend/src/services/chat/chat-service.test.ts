import { ArrayUtils } from '@timeflies/common';
import { ChatNotifyMessage, ChatSendMessage } from '@timeflies/socket-messages';
import { createFakeBattle } from '../battle/battle-service-test-utils';
import { createFakeGlobalEntitiesNoService, createFakeSocketCell } from '../service-test-utils';
import { ChatService } from './chat-service';

describe('chat service', () => {

    describe('on chat-send message received', () => {

        it('throw error if player not in room or battle', async () => {
            const battle = createFakeBattle();

            const globalEntities = createFakeGlobalEntitiesNoService(undefined, battle);
            delete globalEntities.currentBattleMap.mapByPlayerId.p1;
            const service = new ChatService(globalEntities);

            const playerList = ArrayUtils.range(3).map(i => {
                const playerId = 'p' + (i + 1);
                const socketCell = createFakeSocketCell();
                service.onSocketConnect(socketCell, playerId);
                return { playerId, socketCell };
            });

            const { socketCell } = playerList[ 0 ];

            const listener = socketCell.getFirstListener(ChatSendMessage);

            await expect(listener(ChatSendMessage({
                message: 'foo',
                time: 1621373414976
            }).get(), socketCell.send)).rejects.toBeDefined();
        });

        const createEntities = () => {
            const battle = createFakeBattle();

            const globalEntities = createFakeGlobalEntitiesNoService(undefined, battle);
            const service = new ChatService(globalEntities);

            const playerList = ArrayUtils.range(3).map(i => {
                const playerId = 'p' + (i + 1);
                const socketCell = createFakeSocketCell();
                service.onSocketConnect(socketCell, playerId);
                return { playerId, socketCell };
            });

            const { socketCell } = playerList[ 0 ];

            const listener = socketCell.getFirstListener(ChatSendMessage);

            return { playerList, listener, socketCell };
        };

        it('throw error if wrong time', async () => {
            const { listener, socketCell } = createEntities();

            await expect(listener(ChatSendMessage({
                message: 'future',
                time: Date.now() + 1000
            }).get(), socketCell.send)).rejects.toBeDefined();
        });

        describe('on success', () => {
            it('send correct response', async () => {
                const { listener, socketCell } = createEntities();

                await listener(ChatSendMessage({
                    message: 'future',
                    time: 5
                }).get(), socketCell.send);

                expect(socketCell.send).toHaveBeenCalledWith(ChatSendMessage.createResponse(expect.any(String), { success: true }));
            });

            it('send chat-notify message to others players', async () => {
                const { listener, playerList, socketCell } = createEntities();

                await listener(ChatSendMessage({
                    message: 'future',
                    time: 5
                }).get(), socketCell.send);

                for (const { socketCell } of playerList.slice(1)) {
                    expect(socketCell.send).toHaveBeenCalledWith(ChatNotifyMessage({
                        message: 'future',
                        playerId: 'p1',
                        time: 5
                    }));
                }
            });
        });
    });

});
