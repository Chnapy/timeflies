import { ArrayUtils } from '@timeflies/common';
import { ChatNotifyMessage, ChatSendMessage } from '@timeflies/socket-messages';
import { createFakeBattle, createFakeGlobalEntitiesNoService, createFakeSocketCell } from '../battle/battle-service-test-utils';
import { ChatService } from './chat-service';

describe('chat service', () => {

    describe('on chat-send message received', () => {

        it('throw error if player not in room or battle', async () => {
            const battle = createFakeBattle();

            const globalEntities = createFakeGlobalEntitiesNoService(battle);
            delete globalEntities.currentBattleMap.mapByPlayerId.p1;
            const service = new ChatService(globalEntities);

            const playerList = ArrayUtils.range(3).map(i => {
                const playerId = 'p' + (i + 1);
                const socketCell = createFakeSocketCell();
                service.onSocketConnect(socketCell, playerId);
                return { playerId, socketCell };
            });

            const listener = playerList[ 0 ].socketCell.getFirstListener(ChatSendMessage);

            await expect(listener(ChatSendMessage({
                message: 'foo',
                time: 1621373414976
            }).get())).rejects.toBeDefined();
        });

        const createEntities = () => {
            const battle = createFakeBattle();

            const globalEntities = createFakeGlobalEntitiesNoService(battle);
            const service = new ChatService(globalEntities);

            const playerList = ArrayUtils.range(3).map(i => {
                const playerId = 'p' + (i + 1);
                const socketCell = createFakeSocketCell();
                service.onSocketConnect(socketCell, playerId);
                return { playerId, socketCell };
            });

            const listener = playerList[ 0 ].socketCell.getFirstListener(ChatSendMessage);

            return { playerList, listener };
        };

        it('throw error if wrong time', async () => {
            const { listener } = createEntities();

            await expect(listener(ChatSendMessage({
                message: 'future',
                time: Date.now() + 1000
            }).get())).rejects.toBeDefined();
        });

        describe('on success', () => {
            it('send correct response', async () => {
                const { listener } = createEntities();

                await expect(listener(ChatSendMessage({
                    message: 'future',
                    time: 5
                }).get())).resolves.toEqual(ChatSendMessage.createResponse(expect.any(String), { success: true }));
            });

            it('send chat-notify message to others players', async () => {
                const { listener, playerList } = createEntities();

                await listener(ChatSendMessage({
                    message: 'future',
                    time: 5
                }).get());

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
