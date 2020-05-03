import { RoomServerAction, ServerAction, TeamRoom } from '@timeflies/shared';
import { RoomTester } from './room-tester';

describe('# room > on character add request', () => {

    const { createRoomWithCreator, getRoomStateWithMap, getRoomStateWithMapMinCharacters } = RoomTester;

    describe('should fail if', () => {

        it('no map selected', async () => {

            const { receive } = createRoomWithCreator('p1');

            await expect(receive({
                type: 'room/character/add',
                sendTime: -1,
                characterType: 'sampleChar1',
                position: { x: 0, y: 0 }
            })).rejects.toBeDefined();
        });

        it('player is ready', async () => {

            const { receiveJ1, secondTile, j1Infos, createRoom } = getRoomStateWithMapMinCharacters('p1', 'p2', 'm1');

            j1Infos.player.isReady = true;

            createRoom();

            await expect(receiveJ1({
                type: 'room/character/add',
                sendTime: -1,
                characterType: 'sampleChar1',
                position: secondTile.position
            })).rejects.toBeDefined();
        });

        it('targeted position is occupied', async () => {

            const { receiveJ2, j1Infos, tilesTeamJ1, createRoom } = getRoomStateWithMap('p1', 'p2', 'm1', 2);

            const [ firstTile ] = tilesTeamJ1;

            j1Infos.player.characters.push({
                id: 'c1',
                type: 'sampleChar1',
                position: firstTile.position
            });

            createRoom();

            await expect(receiveJ2({
                type: 'room/character/add',
                sendTime: -1,
                characterType: 'sampleChar1',
                position: firstTile.position
            })).rejects.toBeDefined();
        });

        it('targeted position is not from own team', async () => {

            const { receiveJ1, j1Infos, tilesTeamJ1, tilesTeamJ2, teamJ1, createRoom } = getRoomStateWithMap('p1', 'p2', 'm1', 2);

            const [ firstTile ] = tilesTeamJ1;

            j1Infos.player.characters.push({
                id: 'c1',
                type: 'sampleChar1',
                position: firstTile.position
            });
            teamJ1.playersIds.push('p1');

            createRoom();

            const [ otherTeamTile ] = tilesTeamJ2;

            await expect(receiveJ1({
                type: 'room/character/add',
                sendTime: -1,
                characterType: 'sampleChar1',
                position: otherTeamTile.position
            })).rejects.toBeDefined();
        });
    });

    describe('should send to everyone', () => {

        it('the new character', async () => {

            const { receiveJ1, sendListJ1, sendListJ2, tilesTeamJ1, createRoom } = await getRoomStateWithMap('p1', 'p2', 'm1', 2);

            createRoom();

            const [ firstTile ] = tilesTeamJ1;

            await receiveJ1({
                type: 'room/character/add',
                sendTime: -1,
                characterType: 'sampleChar1',
                position: firstTile.position
            });

            const expected: RoomServerAction.CharacterSet = {
                type: 'room/character/set',
                sendTime: expect.anything(),
                action: 'add',
                playerId: 'p1',
                character: {
                    id: expect.any(String),
                    type: 'sampleChar1',
                    position: firstTile.position
                },
                teamList: expect.anything()
            };

            expect(sendListJ1).toContainEqual<RoomServerAction.CharacterSet>(expected);
            expect(sendListJ2).toContainEqual<RoomServerAction.CharacterSet>(expected);
        });

        it('the new team', async () => {

            const { receiveJ1, sendListJ1, sendListJ2, tilesTeamJ1, teamJ1, teamJ2, createRoom } = await getRoomStateWithMap('p1', 'p2', 'm1', 2);

            createRoom();

            const [ firstTile ] = tilesTeamJ1;

            await receiveJ1({
                type: 'room/character/add',
                sendTime: -1,
                characterType: 'sampleChar1',
                position: firstTile.position
            });

            const expected: RoomServerAction.CharacterSet = {
                type: 'room/character/set',
                sendTime: expect.anything(),
                action: 'add',
                playerId: 'p1',
                character: expect.anything(),
                teamList: [
                    {
                        ...teamJ1,
                        playersIds: [ 'p1' ]
                    },
                    teamJ2
                ]
            };

            expect(sendListJ1).toContainEqual<RoomServerAction.CharacterSet>(expected);
            expect(sendListJ2).toContainEqual<RoomServerAction.CharacterSet>(expected);
        });

        it('correct data on multiple character add', async () => {

            const { receiveJ1, receiveJ2, sendListJ1, sendListJ2, tilesTeamJ1, tilesTeamJ2, teamJ1, teamJ2, createRoom } = await getRoomStateWithMap('p1', 'p2', 'm1', 2);

            createRoom();

            const [ firstTileT1 ] = tilesTeamJ1;
            const [ firstTileT2, secondTileT2 ] = tilesTeamJ2;

            await receiveJ1({
                type: 'room/character/add',
                sendTime: -1,
                characterType: 'sampleChar1',
                position: firstTileT1.position
            });

            await receiveJ2({
                type: 'room/character/add',
                sendTime: -1,
                characterType: 'sampleChar2',
                position: firstTileT2.position
            });

            await receiveJ2({
                type: 'room/character/add',
                sendTime: -1,
                characterType: 'sampleChar1',
                position: secondTileT2.position
            });

            const expected: RoomServerAction.CharacterSet[] = [
                {
                    type: 'room/character/set',
                    sendTime: expect.anything(),
                    action: 'add',
                    playerId: 'p1',
                    character: {
                        id: expect.any(String),
                        position: firstTileT1.position,
                        type: 'sampleChar1'
                    },
                    teamList: expect.arrayContaining<TeamRoom>([
                        expect.objectContaining<TeamRoom>({
                            ...teamJ1,
                            playersIds: [ 'p1' ]
                        })
                    ])
                },
                {
                    type: 'room/character/set',
                    sendTime: expect.anything(),
                    action: 'add',
                    playerId: 'p2',
                    character: {
                        id: expect.any(String),
                        position: firstTileT2.position,
                        type: 'sampleChar2'
                    },
                    teamList: expect.arrayContaining<TeamRoom>([
                        expect.objectContaining<TeamRoom>({
                            ...teamJ1,
                            playersIds: [ 'p1' ]
                        }),
                        expect.objectContaining<TeamRoom>({
                            ...teamJ2,
                            playersIds: [ 'p2' ]
                        })
                    ])
                },
                {
                    type: 'room/character/set',
                    sendTime: expect.anything(),
                    action: 'add',
                    playerId: 'p2',
                    character: {
                        id: expect.any(String),
                        position: secondTileT2.position,
                        type: 'sampleChar1'
                    },
                    teamList: expect.arrayContaining<TeamRoom>([
                        expect.objectContaining<TeamRoom>({
                            ...teamJ1,
                            playersIds: [ 'p1' ]
                        }),
                        expect.objectContaining<TeamRoom>({
                            ...teamJ2,
                            playersIds: [ 'p2' ]
                        })
                    ])
                }
            ];

            const expectActionList = (actionList: ServerAction[]) =>
                expect(actionList.filter(a => a.type === 'room/character/set'))
                    .toEqual(expect.arrayContaining(expected));

            expectActionList(sendListJ1);
            expectActionList(sendListJ2);
        });
    });
});
