import { createPosition } from '@timeflies/common';
import { RoomCharacterPlacementMessage, RoomCharacterRemoveMessage, RoomCharacterSelectMessage, RoomStaticCharacter } from '@timeflies/socket-messages';
import { SocketError } from '@timeflies/socket-server';
import { getFakeRoomEntities } from '../room-service-test-utils';
import { CharacterRoomService } from './character-room-service';

describe('character room service', () => {

    const getEntities = () => {
        const entities = getFakeRoomEntities(CharacterRoomService);

        entities.room.staticCharacterList = [ {
            characterId: 'c1',
            playerId: 'p1',
            characterRole: 'tacka',
            placement: null
        } ];

        return entities;
    };

    describe('on character select message', () => {

        it('throw error if player is ready', () => {
            const { socketCellP1, connectSocket, room } = getEntities();

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomCharacterSelectMessage);

            room.staticPlayerList = [ {
                playerId: 'p1',
                playerName: '',
                teamColor: '#000',
                ready: true,
                type: 'player'
            } ];

            expect(() =>
                listener(RoomCharacterSelectMessage({
                    aiPlayerId: null,
                    characterRole: 'tacka'
                }).get(), socketCellP1.send)
            ).toThrowError(SocketError);
        });

        it('throw error if player not in a team', () => {
            const { socketCellP1, connectSocket, room } = getEntities();

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomCharacterSelectMessage);

            room.staticPlayerList = [ {
                playerId: 'p1',
                playerName: '',
                teamColor: null,
                ready: false,
                type: 'player'
            } ];

            expect(() =>
                listener(RoomCharacterSelectMessage({
                    aiPlayerId: null,
                    characterRole: 'tacka'
                }).get(), socketCellP1.send)
            ).toThrowError(SocketError);
        });

        it('throw error if team is full', () => {
            const { socketCellP1, connectSocket, room } = getEntities();

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomCharacterSelectMessage);

            room.mapInfos = {
                mapId: 'm1',
                name: '',
                nbrTeams: 1,
                nbrTeamCharacters: 1,
                schemaLink: '',
                imagesLinks: {}
            };
            room.staticPlayerList = [ {
                playerId: 'p1',
                playerName: '',
                teamColor: '#000',
                ready: false,
                type: 'player'
            } ];
            room.staticCharacterList = [ {
                characterId: 'c1',
                characterRole: 'meti',
                playerId: 'p1',
                placement: null
            } ];

            expect(() =>
                listener(RoomCharacterSelectMessage({
                    aiPlayerId: null,
                    characterRole: 'tacka'
                }).get(), socketCellP1.send)
            ).toThrowError(SocketError);
        });

        it('select character', async () => {
            const { socketCellP1, connectSocket, room } = getEntities();

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomCharacterSelectMessage);

            room.staticPlayerList = [ {
                playerId: 'p1',
                playerName: '',
                teamColor: '#000',
                ready: false,
                type: 'player'
            } ];

            await listener(RoomCharacterSelectMessage({
                aiPlayerId: null,
                characterRole: 'tacka'
            }).get(), socketCellP1.send);

            expect(room.staticCharacterList).toEqual(expect.arrayContaining<RoomStaticCharacter>([
                {
                    characterId: expect.any(String),
                    characterRole: 'tacka',
                    playerId: 'p1',
                    placement: null
                }
            ]));
        });

        it('answers with room state, and send update to other players', async () => {
            const { socketCellP1, connectSocket, room, expectPlayersAnswers } = getEntities();

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomCharacterSelectMessage);

            room.staticPlayerList = [
                {
                    playerId: 'p1',
                    playerName: '',
                    teamColor: '#000',
                    ready: false,
                    type: 'player'
                },
                {
                    playerId: 'p2',
                    playerName: '',
                    teamColor: '#000',
                    ready: false,
                    type: 'player'
                }
            ];

            await listener(RoomCharacterSelectMessage({
                aiPlayerId: null,
                characterRole: 'tacka'
            }).get(), socketCellP1.send);

            expectPlayersAnswers(RoomCharacterSelectMessage);
        });

        describe('AI', () => {

            it('throw error if wrong AI player id', () => {
                const { socketCellP1, connectSocket, room } = getEntities();

                connectSocket();

                const listener = socketCellP1.getFirstListener(RoomCharacterSelectMessage);

                room.staticPlayerList = [
                    {
                        playerId: 'p1',
                        playerName: '',
                        teamColor: '#000',
                        ready: false,
                        type: 'player'
                    },
                    {
                        playerId: 'ai1',
                        playerName: '',
                        teamColor: '#000',
                        ready: false,
                        type: 'ai'
                    }
                ];

                expect(() =>
                    listener(RoomCharacterSelectMessage({
                        aiPlayerId: 'wrong-id',
                        characterRole: 'tacka'
                    }).get(), socketCellP1.send)
                ).toThrowError(SocketError);
            });

            it('throw error if not player id not AI', () => {
                const { socketCellP1, connectSocket, room } = getEntities();

                room.staticPlayerList = [
                    {
                        playerId: 'p1',
                        playerName: '',
                        teamColor: '#000',
                        ready: false,
                        type: 'player'
                    },
                    {
                        playerId: 'p2',
                        playerName: '',
                        teamColor: '#000',
                        ready: false,
                        type: 'player'
                    }
                ];

                connectSocket();

                const listener = socketCellP1.getFirstListener(RoomCharacterSelectMessage);

                expect(() =>
                    listener(RoomCharacterSelectMessage({
                        aiPlayerId: 'p2',
                        characterRole: 'tacka'
                    }).get(), socketCellP1.send)
                ).toThrowError(SocketError);
            });

            it('throw error if AI player id and player not admin', () => {
                const { socketCellP1, connectSocket, room } = getEntities();

                room.playerAdminId = 'foo';
                room.staticPlayerList = [
                    {
                        playerId: 'p1',
                        playerName: '',
                        teamColor: '#000',
                        ready: false,
                        type: 'player'
                    },
                    {
                        playerId: 'ai1',
                        playerName: '',
                        teamColor: '#000',
                        ready: false,
                        type: 'ai'
                    }
                ];

                connectSocket();

                const listener = socketCellP1.getFirstListener(RoomCharacterSelectMessage);

                expect(() =>
                    listener(RoomCharacterSelectMessage({
                        aiPlayerId: 'ai1',
                        characterRole: 'tacka'
                    }).get(), socketCellP1.send)
                ).toThrowError(SocketError);
            });

            it('select AI character', async () => {
                const { socketCellP1, connectSocket, room } = getEntities();

                connectSocket();

                const listener = socketCellP1.getFirstListener(RoomCharacterSelectMessage);

                room.staticPlayerList = [
                    {
                        playerId: 'p1',
                        playerName: '',
                        teamColor: '#000',
                        ready: false,
                        type: 'player'
                    },
                    {
                        playerId: 'ai1',
                        playerName: '',
                        teamColor: '#000',
                        ready: false,
                        type: 'ai'
                    }
                ];

                await listener(RoomCharacterSelectMessage({
                    aiPlayerId: 'ai1',
                    characterRole: 'tacka'
                }).get(), socketCellP1.send);

                expect(room.staticCharacterList).toEqual(expect.arrayContaining<RoomStaticCharacter>([
                    {
                        characterId: expect.any(String),
                        characterRole: 'tacka',
                        playerId: 'ai1',
                        placement: null
                    }
                ]));
            });
        });
    });

    describe('on character remove message', () => {

        it('throw error if wrong character id', () => {
            const { socketCellP1, connectSocket } = getEntities();

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomCharacterRemoveMessage);

            expect(() =>
                listener(RoomCharacterRemoveMessage({
                    characterId: 'wrong-id'
                }).get(), socketCellP1.send)
            ).toThrowError(SocketError);
        });

        it('throw error if not character of player', () => {
            const { socketCellP2, connectSocket } = getEntities();

            connectSocket();

            const listener = socketCellP2.getFirstListener(RoomCharacterRemoveMessage);

            expect(() =>
                listener(RoomCharacterRemoveMessage({
                    characterId: 'c1'
                }).get(), socketCellP2.send)
            ).toThrowError(SocketError);
        });

        it('throw error if player is ready', () => {
            const { socketCellP1, connectSocket, room } = getEntities();

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomCharacterRemoveMessage);

            room.staticPlayerList = [ {
                playerId: 'p1',
                playerName: '',
                ready: true,
                teamColor: '#000',
                type: 'player'
            } ];
            room.staticCharacterList = [ {
                characterId: 'c1',
                playerId: 'p1',
                characterRole: 'tacka',
                placement: null
            } ];

            expect(() =>
                listener(RoomCharacterRemoveMessage({
                    characterId: 'c1'
                }).get(), socketCellP1.send)
            ).toThrowError(SocketError);
        });

        it('remove character', async () => {
            const { socketCellP1, connectSocket, room } = getEntities();

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomCharacterRemoveMessage);

            room.staticCharacterList = [ {
                characterId: 'c1',
                playerId: 'p1',
                characterRole: 'tacka',
                placement: null
            } ];

            await listener(RoomCharacterRemoveMessage({
                characterId: 'c1'
            }).get(), socketCellP1.send);

            expect(room.staticCharacterList).toEqual([]);
        });

        it('answers with room state, and send update to other players', async () => {
            const { socketCellP1, connectSocket, expectPlayersAnswers } = getEntities();

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomCharacterRemoveMessage);

            await listener(RoomCharacterRemoveMessage({
                characterId: 'c1'
            }).get(), socketCellP1.send);

            expectPlayersAnswers(RoomCharacterRemoveMessage);
        });

        describe('AI', () => {
            it('throw error if AI character id and player not admin', () => {
                const { socketCellP1, connectSocket, room } = getEntities();

                room.playerAdminId = 'foo';
                room.staticPlayerList = [
                    {
                        playerId: 'p1',
                        playerName: '',
                        ready: false,
                        teamColor: '#000',
                        type: 'player'
                    },
                    {
                        playerId: 'ai1',
                        playerName: '',
                        teamColor: '#000',
                        ready: false,
                        type: 'ai'
                    }
                ];
                room.staticCharacterList = [ {
                    characterId: 'c1',
                    playerId: 'ai1',
                    characterRole: 'tacka',
                    placement: null
                } ];

                connectSocket();

                const listener = socketCellP1.getFirstListener(RoomCharacterRemoveMessage);

                expect(() =>
                    listener(RoomCharacterRemoveMessage({
                        characterId: 'c1'
                    }).get(), socketCellP1.send)
                ).toThrowError(SocketError);
            });

            it('remove AI character', async () => {
                const { socketCellP1, connectSocket, room } = getEntities();

                room.staticPlayerList = [
                    {
                        playerId: 'p1',
                        playerName: '',
                        ready: false,
                        teamColor: '#000',
                        type: 'player'
                    },
                    {
                        playerId: 'ai1',
                        playerName: '',
                        teamColor: '#000',
                        ready: false,
                        type: 'ai'
                    }
                ];
                room.staticCharacterList = [ {
                    characterId: 'c1',
                    playerId: 'ai1',
                    characterRole: 'tacka',
                    placement: null
                } ];

                connectSocket();

                const listener = socketCellP1.getFirstListener(RoomCharacterRemoveMessage);

                await listener(RoomCharacterRemoveMessage({
                    characterId: 'c1'
                }).get(), socketCellP1.send);

                expect(room.staticCharacterList).toEqual([]);
            });
        });
    });

    describe('on character placement message', () => {

        it('throw error if wrong character id', async () => {
            const { socketCellP1, connectSocket } = getEntities();

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomCharacterPlacementMessage);

            expect(() =>
                listener(RoomCharacterPlacementMessage({
                    characterId: 'wrong-id',
                    position: null
                }).get(), socketCellP1.send)
            ).toThrowError(SocketError);
        });

        it('throw error if not character of player', async () => {
            const { socketCellP1, service } = getEntities();

            service.onSocketConnect(socketCellP1, 'p2');

            const listener = socketCellP1.getFirstListener(RoomCharacterPlacementMessage);

            expect(() =>
                listener(RoomCharacterPlacementMessage({
                    characterId: 'c1',
                    position: null
                }).get(), socketCellP1.send)
            ).toThrowError(SocketError);
        });

        it('throw error if player is ready', async () => {
            const { socketCellP1, connectSocket, room } = getEntities();

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomCharacterPlacementMessage);

            room.staticPlayerList = [ {
                playerId: 'p1',
                playerName: '',
                ready: true,
                teamColor: '#000',
                type: 'player'
            } ];
            room.staticCharacterList = [ {
                characterId: 'c1',
                playerId: 'p1',
                characterRole: 'tacka',
                placement: null
            } ];

            expect(() =>
                listener(RoomCharacterPlacementMessage({
                    characterId: 'c1',
                    position: null
                }).get(), socketCellP1.send)
            ).toThrowError(SocketError);
        });

        it('throw error if position not in placement tile', async () => {
            const { socketCellP1, connectSocket, room } = getEntities();

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomCharacterPlacementMessage);

            room.staticPlayerList = [ {
                playerId: 'p1',
                playerName: '',
                ready: false,
                teamColor: '#000',
                type: 'player'
            } ];
            room.staticCharacterList = [ {
                characterId: 'c1',
                playerId: 'p1',
                characterRole: 'tacka',
                placement: null
            } ];
            room.mapPlacementTiles = {
                '#000': [ createPosition(2, 1) ]
            };

            expect(() =>
                listener(RoomCharacterPlacementMessage({
                    characterId: 'c1',
                    position: createPosition(1, 1)
                }).get(), socketCellP1.send)
            ).toThrowError(SocketError);
        });

        it('throw error if position occupied by other character', async () => {
            const { socketCellP1, connectSocket, room } = getEntities();

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomCharacterPlacementMessage);

            room.staticPlayerList = [ {
                playerId: 'p1',
                playerName: '',
                ready: false,
                teamColor: '#000',
                type: 'player'
            } ];
            room.staticCharacterList = [
                {
                    characterId: 'c1',
                    playerId: 'p1',
                    characterRole: 'tacka',
                    placement: null
                },
                {
                    characterId: 'c2',
                    playerId: 'p2',
                    characterRole: 'tacka',
                    placement: createPosition(1, 1)
                }
            ];
            room.mapPlacementTiles = {
                '#000': [ createPosition(1, 1) ]
            };

            expect(() =>
                listener(RoomCharacterPlacementMessage({
                    characterId: 'c1',
                    position: createPosition(1, 1)
                }).get(), socketCellP1.send)
            ).toThrowError(SocketError);
        });

        it('place character', async () => {
            const { socketCellP1, connectSocket, room } = getEntities();

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomCharacterPlacementMessage);

            room.staticPlayerList = [ {
                playerId: 'p1',
                playerName: '',
                ready: false,
                teamColor: '#000',
                type: 'player'
            } ];
            room.staticCharacterList = [
                {
                    characterId: 'c1',
                    playerId: 'p1',
                    characterRole: 'tacka',
                    placement: null
                }
            ];
            room.mapPlacementTiles = {
                '#000': [ createPosition(1, 1) ]
            };

            await listener(RoomCharacterPlacementMessage({
                characterId: 'c1',
                position: createPosition(1, 1)
            }).get(), socketCellP1.send);

            expect(room.staticCharacterList).toEqual<RoomStaticCharacter[]>([ {
                characterId: 'c1',
                playerId: 'p1',
                characterRole: 'tacka',
                placement: createPosition(1, 1)
            } ]);

            await listener(RoomCharacterPlacementMessage({
                characterId: 'c1',
                position: null
            }).get(), socketCellP1.send);

            expect(room.staticCharacterList).toEqual<RoomStaticCharacter[]>([ {
                characterId: 'c1',
                playerId: 'p1',
                characterRole: 'tacka',
                placement: null
            } ]);
        });

        it('answers with room state, and send update to other players', async () => {
            const { socketCellP1, connectSocket, room, expectPlayersAnswers } = getEntities();

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomCharacterPlacementMessage);

            room.staticPlayerList = [
                {
                    playerId: 'p1',
                    playerName: '',
                    ready: false,
                    teamColor: '#000',
                    type: 'player'
                },
                {
                    playerId: 'p2',
                    playerName: '',
                    teamColor: '#000',
                    ready: false,
                    type: 'player'
                }
            ];
            room.staticCharacterList = [
                {
                    characterId: 'c1',
                    playerId: 'p1',
                    characterRole: 'tacka',
                    placement: null
                }
            ];
            room.mapPlacementTiles = {
                '#000': [ createPosition(1, 1) ]
            };

            await listener(RoomCharacterPlacementMessage({
                characterId: 'c1',
                position: createPosition(1, 1)
            }).get(), socketCellP1.send);

            expectPlayersAnswers(RoomCharacterPlacementMessage);
        });

        describe('AI', () => {
            it('throw error if AI character id and player not admin', () => {
                const { socketCellP1, connectSocket, room } = getEntities();

                room.playerAdminId = 'foo';
                room.staticPlayerList = [
                    {
                        playerId: 'p1',
                        playerName: '',
                        ready: false,
                        teamColor: '#000',
                        type: 'player'
                    },
                    {
                        playerId: 'ai1',
                        playerName: '',
                        teamColor: '#000',
                        ready: false,
                        type: 'ai'
                    }
                ];
                room.staticCharacterList = [ {
                    characterId: 'c1',
                    playerId: 'ai1',
                    characterRole: 'tacka',
                    placement: null
                } ];
                room.mapPlacementTiles = {
                    '#000': [ createPosition(1, 1) ]
                };

                connectSocket();

                const listener = socketCellP1.getFirstListener(RoomCharacterPlacementMessage);

                expect(() =>
                    listener(RoomCharacterPlacementMessage({
                        characterId: 'c1',
                        position: createPosition(1, 1)
                    }).get(), socketCellP1.send)
                ).toThrowError(SocketError);
            });

            it('place AI character', async () => {
                const { socketCellP1, connectSocket, room } = getEntities();

                room.staticPlayerList = [
                    {
                        playerId: 'p1',
                        playerName: '',
                        ready: false,
                        teamColor: '#000',
                        type: 'player'
                    },
                    {
                        playerId: 'ai1',
                        playerName: '',
                        teamColor: '#000',
                        ready: false,
                        type: 'ai'
                    }
                ];
                room.staticCharacterList = [ {
                    characterId: 'c1',
                    playerId: 'ai1',
                    characterRole: 'tacka',
                    placement: null
                } ];
                room.mapPlacementTiles = {
                    '#000': [ createPosition(1, 1) ]
                };

                connectSocket();

                const listener = socketCellP1.getFirstListener(RoomCharacterPlacementMessage);

                await listener(RoomCharacterPlacementMessage({
                    characterId: 'c1',
                    position: createPosition(1, 1)
                }).get(), socketCellP1.send);

                expect(room.staticCharacterList).toEqual<RoomStaticCharacter[]>([ {
                    characterId: 'c1',
                    playerId: 'ai1',
                    characterRole: 'tacka',
                    placement: createPosition(1, 1)
                } ]);
            });
        });
    });
});
