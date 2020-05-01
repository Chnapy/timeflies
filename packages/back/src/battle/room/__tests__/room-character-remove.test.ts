import { RoomServerAction, TeamRoom } from '@timeflies/shared';
import { seedWebSocket } from '../../../transport/ws/WSSocket.seed';
import { RoomTester } from './room-tester';

describe('# room > on character remove request', () => {

    const { createPlayer, createRoom, createRoomWithMap, createRoomWithMapMinCharacters } = RoomTester;

    describe('should fail if', () => {

        it('no map selected', async () => {

            const { ws, receive } = seedWebSocket();

            const creator = createPlayer('p1', ws);

            createRoom(creator);

            await expect(receive({
                type: 'room/character/remove',
                sendTime: -1,
                position: { x: 0, y: 0 }
            })).rejects.toBeDefined();
        });

        it('player is ready', async () => {

            const { receiveJ1, firstTile } = await createRoomWithMapMinCharacters('p1', 'p2', 'm1');

            await receiveJ1({
                type: 'room/player/state',
                sendTime: -1,
                isReady: true,
                isLoading: false
            });

            await expect(receiveJ1({
                type: 'room/character/remove',
                sendTime: -1,
                position: firstTile.position
            })).rejects.toBeDefined();
        });

        it('target position does not exist', async () => {

            const { receiveJ1 } = await createRoomWithMap('p1', 'p2', 'm1', 2);

            await expect(receiveJ1({
                type: 'room/character/remove',
                sendTime: -1,
                position: { x: 0, y: 0 }
            })).rejects.toBeDefined();
        });

        it('target position is not occupied', async () => {

            const { receiveJ1, tilesTeamJ1 } = await createRoomWithMap('p1', 'p2', 'm1', 2);

            const [ firstTile ] = tilesTeamJ1;

            await expect(receiveJ1({
                type: 'room/character/remove',
                sendTime: -1,
                position: firstTile.position
            })).rejects.toBeDefined();
        });

        it('target position character is not mine', async () => {

            const { receiveJ1, receiveJ2, tilesTeamJ1 } = await createRoomWithMap('p1', 'p2', 'm1', 2);

            const [ firstTile ] = tilesTeamJ1;

            await receiveJ1({
                type: 'room/character/add',
                sendTime: -1,
                characterType: 'sampleChar1',
                position: firstTile.position
            });

            await expect(receiveJ2({
                type: 'room/character/remove',
                sendTime: -1,
                position: firstTile.position
            })).rejects.toBeDefined();
        });
    });

    it('should send remove action with current team list', async () => {

        const { receiveJ1, sendListJ1, sendListJ2, tilesTeamJ1 } = await createRoomWithMap('p1', 'p2', 'm1', 2);

        const [ firstTile, secondTile ] = tilesTeamJ1;

        await receiveJ1({
            type: 'room/character/add',
            sendTime: -1,
            characterType: 'sampleChar1',
            position: firstTile.position
        });

        const { character } = sendListJ1
            .find((a): a is Extract<RoomServerAction.CharacterSet, { action: 'add' }> =>
                a.type === 'room/character/set'
            )!;

        await receiveJ1({
            type: 'room/character/add',
            sendTime: -1,
            characterType: 'sampleChar1',
            position: secondTile.position
        });

        await receiveJ1({
            type: 'room/character/remove',
            sendTime: -1,
            position: firstTile.position
        });

        const expected = expect.arrayContaining([
            expect.objectContaining<Partial<RoomServerAction.CharacterSet>>({
                type: 'room/character/set',
                action: 'remove',
                playerId: 'p1',
                characterId: character.id,
                teams: expect.arrayContaining([
                    expect.objectContaining<Partial<TeamRoom>>({
                        playersIds: [ 'p1' ]
                    })
                ])
            })
        ]);

        expect(sendListJ1).toEqual(expected);
        expect(sendListJ2).toEqual(expected);
    });

    it('should remove player from its team if no any character left', async () => {

        const { receiveJ1, sendListJ1, sendListJ2, tilesTeamJ1 } = await createRoomWithMap('p1', 'p2', 'm1', 2);

        const [ firstTile ] = tilesTeamJ1;

        await receiveJ1({
            type: 'room/character/add',
            sendTime: -1,
            characterType: 'sampleChar1',
            position: firstTile.position
        });

        const { character } = sendListJ1
            .find((a): a is Extract<RoomServerAction.CharacterSet, { action: 'add' }> =>
                a.type === 'room/character/set'
            )!;

        await receiveJ1({
            type: 'room/character/remove',
            sendTime: -1,
            position: firstTile.position
        });

        const expected = expect.arrayContaining([
            expect.objectContaining<Partial<RoomServerAction.CharacterSet>>({
                type: 'room/character/set',
                action: 'remove',
                playerId: 'p1',
                characterId: character.id,
                teams: expect.not.arrayContaining([
                    expect.objectContaining<Partial<TeamRoom>>({
                        playersIds: [ 'p1' ]
                    })
                ])
            })
        ]);

        expect(sendListJ1).toEqual(expected);
        expect(sendListJ2).toEqual(expected);
    });
});
