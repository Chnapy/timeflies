import { RoomServerAction, TeamRoom } from '@timeflies/shared';
import { RoomTester } from './room-tester';

describe('# room > on character remove request', () => {

    const { createRoomWithCreator, getRoomStateWithMap, getRoomStateWithMapMinCharacters } = RoomTester;

    describe('should fail if', () => {

        it('no map selected', async () => {

            const { receive } = createRoomWithCreator('p1');

            await expect(receive({
                type: 'room/character/remove',
                sendTime: -1,
                position: { x: 0, y: 0 }
            })).rejects.toBeDefined();
        });

        it('player is ready', async () => {

            const { receiveJ1, firstTile, j1Infos, createRoom } = getRoomStateWithMapMinCharacters('p1', 'p2', 'm1');

            j1Infos.player.isReady = true;

            createRoom();

            await expect(receiveJ1({
                type: 'room/character/remove',
                sendTime: -1,
                position: firstTile.position
            })).rejects.toBeDefined();
        });

        it('target position does not exist', async () => {

            const { receiveJ1, createRoom } = getRoomStateWithMap('p1', 'p2', 'm1', 2);

            createRoom();

            await expect(receiveJ1({
                type: 'room/character/remove',
                sendTime: -1,
                position: { x: 32, y: 14 }
            })).rejects.toBeDefined();
        });

        it('target position is not occupied', async () => {

            const { receiveJ1, tilesTeamJ1, createRoom } = getRoomStateWithMap('p1', 'p2', 'm1', 2);

            createRoom();

            const [ firstTile ] = tilesTeamJ1;

            await expect(receiveJ1({
                type: 'room/character/remove',
                sendTime: -1,
                position: firstTile.position
            })).rejects.toBeDefined();
        });

        it('target position character is not mine', async () => {

            const { receiveJ2, tilesTeamJ1, j1Infos, createRoom } = await getRoomStateWithMap('p1', 'p2', 'm1', 2);

            const [ firstTile ] = tilesTeamJ1;

            j1Infos.player.characters.push({
                id: 'c1',
                type: 'sampleChar1',
                position: firstTile.position
            });

            createRoom();

            await expect(receiveJ2({
                type: 'room/character/remove',
                sendTime: -1,
                position: firstTile.position
            })).rejects.toBeDefined();
        });
    });

    it('should send remove action with current team list', async () => {

        const { receiveJ1, sendListJ1, sendListJ2, tilesTeamJ1, j1Infos, teamJ1, createRoom } = getRoomStateWithMap('p1', 'p2', 'm1', 2);

        const [ firstTile, secondTile ] = tilesTeamJ1;

        j1Infos.player.characters.push(
            {
                id: 'c1',
                type: 'sampleChar1',
                position: firstTile.position
            },
            {
                id: 'c2',
                type: 'sampleChar1',
                position: secondTile.position
            }
        );
        teamJ1.playersIds.push('p1');

        createRoom();

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
                characterId: 'c1',
                teamList: expect.arrayContaining([
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

        const { receiveJ1, sendListJ1, sendListJ2, tilesTeamJ1, j1Infos, teamJ1, createRoom } = getRoomStateWithMap('p1', 'p2', 'm1', 2);

        const [ firstTile ] = tilesTeamJ1;

        j1Infos.player.characters.push({
            id: 'c1',
            type: 'sampleChar1',
            position: firstTile.position
        });
        teamJ1.playersIds.push('p1');
        
        createRoom();

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
                characterId: 'c1',
                teamList: expect.not.arrayContaining([
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
