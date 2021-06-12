// should be first
jest.mock('../battle/battle');
jest.mock('fs');

/* eslint-disable import/first */
import { createPosition } from '@timeflies/common';
import { timerTester } from '@timeflies/devtools';
import { MapInfos, RoomStateData, RoomStaticPlayer } from '@timeflies/socket-messages';
import fs from 'fs';
import TiledMap from 'tiled-types';
import { createBattle } from '../battle/battle';
import { createFakeBattle } from '../battle/battle-service-test-utils';
import { createFakeGlobalEntitiesNoService } from '../service-test-utils';
import { createServices } from '../services';
import { createRoom } from './room';
/* eslint-enable import/first */


describe('room', () => {

    let fsReadFileSpy: jest.SpyInstance;

    beforeAll(() => {
        fsReadFileSpy = jest.spyOn(fs, 'readFile')
            .mockImplementation(((path: string, options: unknown, callback: (err: null, buffer: string) => void) => {
                callback(
                    null,
                    JSON.stringify({
                        width: 3,
                        height: 3,
                        layers: [
                            {
                                name: 'placement',
                                data: [
                                    1, 2, 3,
                                    3, 1, 2,
                                    2, 3, 1
                                ]
                            }
                        ]
                    } as TiledMap)
                );
            }) as any);
    });

    afterAll(() => {
        fsReadFileSpy.mockRestore();
    });

    const getRoom = () => createRoom({
        ...createFakeGlobalEntitiesNoService(),
        services: createServices(createFakeGlobalEntitiesNoService())
    });

    it('getRoomStateData gives room state', () => {
        const room = getRoom();

        expect(room.getRoomStateData()).toEqual<RoomStateData>({
            roomId: expect.any(String),
            playerAdminId: expect.any(String),
            mapInfos: expect.any(Object),
            mapPlacementTiles: expect.any(Object),
            teamColorList: expect.any(Array),
            staticPlayerList: expect.any(Array),
            staticCharacterList: expect.any(Array)
        });
    });

    it('playerJoin add player to list', () => {
        const room = getRoom();

        room.playerJoin({
            playerId: 'p1',
            playerName: 'p-1',
            ready: false,
            teamColor: null
        });

        expect(room.getRoomStateData().staticPlayerList).toEqual<RoomStaticPlayer[]>([ {
            playerId: 'p1',
            playerName: 'p-1',
            ready: false,
            teamColor: null
        } ]);
    });

    it('playerAdminId is defined by first player join', () => {
        const room = getRoom();

        room.playerJoin({
            playerId: 'p1',
            playerName: 'p-1',
            ready: false,
            teamColor: null
        });

        room.playerJoin({
            playerId: 'p2',
            playerName: 'p-2',
            ready: false,
            teamColor: null
        });

        expect(room.getRoomStateData().playerAdminId).toEqual('p1');
    });

    it('playerReady change player ready', () => {
        const room = getRoom();

        room.playerJoin({
            playerId: 'p1',
            playerName: 'p-1',
            ready: false,
            teamColor: null
        });

        room.playerReady('p1', true);

        expect(room.getRoomStateData().staticPlayerList).toEqual([ expect.objectContaining<Partial<RoomStaticPlayer>>({
            playerId: 'p1',
            ready: true
        }) ]);
    });

    it('teamJoin change player team', () => {
        const room = getRoom();

        room.playerJoin({
            playerId: 'p1',
            playerName: 'p-1',
            ready: false,
            teamColor: null
        });

        room.teamJoin('p1', '#000');

        expect(room.getRoomStateData().staticPlayerList).toEqual([ expect.objectContaining<Partial<RoomStaticPlayer>>({
            playerId: 'p1',
            teamColor: '#000'
        }) ]);
    });

    it('characterSelect add character to list', () => {
        const room = getRoom();

        room.characterSelect({
            characterId: 'c1',
            playerId: 'p1',
            characterRole: 'tacka',
            placement: null
        });

        expect(room.getRoomStateData().staticCharacterList).toEqual([ {
            characterId: 'c1',
            playerId: 'p1',
            characterRole: 'tacka',
            placement: null
        } ]);
    });

    it('characterRemove remove character from list', () => {
        const room = getRoom();

        room.characterSelect({
            characterId: 'c1',
            playerId: 'p1',
            characterRole: 'tacka',
            placement: null
        });

        room.characterRemove('c1');

        expect(room.getRoomStateData().staticCharacterList).toEqual([]);
    });

    it('characterPlacement change character position', () => {
        const room = getRoom();

        room.characterSelect({
            characterId: 'c1',
            playerId: 'p1',
            characterRole: 'tacka',
            placement: null
        });

        room.characterPlacement('c1', createPosition(1, 1));

        expect(room.getRoomStateData().staticCharacterList).toEqual([ {
            characterId: 'c1',
            playerId: 'p1',
            characterRole: 'tacka',
            placement: createPosition(1, 1)
        } ]);
    });

    it('playerLeave remove player and its characters', () => {
        const room = getRoom();

        room.playerJoin({
            playerId: 'p1',
            playerName: 'p-1',
            ready: false,
            teamColor: null
        });

        room.characterSelect({
            characterId: 'c1',
            playerId: 'p1',
            characterRole: 'tacka',
            placement: null
        });

        room.playerLeave('p1');

        expect(room.getRoomStateData().staticCharacterList).toEqual([]);
        expect(room.getRoomStateData().staticPlayerList).toEqual([]);
    });

    it('playerLeave change player admin if needed', () => {
        const room = getRoom();

        room.playerJoin({
            playerId: 'p1',
            playerName: 'p-1',
            ready: false,
            teamColor: null
        });

        room.playerJoin({
            playerId: 'p2',
            playerName: 'p-2',
            ready: false,
            teamColor: null
        });

        room.playerLeave('p1');

        expect(room.getRoomStateData().playerAdminId).toEqual('p2');
    });

    it('mapSelect change map', async () => {
        const room = getRoom();

        await room.mapSelect({
            mapId: 'm1',
            name: 'm-1',
            nbrTeams: 3,
            nbrTeamCharacters: 4,
            schemaLink: 'foo',
            imagesLinks: {}
        });

        expect(room.getRoomStateData().mapInfos).toEqual<MapInfos>({
            mapId: 'm1',
            name: 'm-1',
            nbrTeams: 3,
            nbrTeamCharacters: 4,
            schemaLink: 'https://host.com/static/foo',
            imagesLinks: {}
        });
    });

    it('mapSelect reset all characters position', async () => {

        const room = getRoom();

        room.characterSelect({
            characterId: 'c1',
            playerId: 'p1',
            characterRole: 'tacka',
            placement: createPosition(1, 1)
        });

        await room.mapSelect({
            mapId: 'm1',
            name: 'm-1',
            nbrTeams: 3,
            nbrTeamCharacters: 3,
            schemaLink: 'foo',
            imagesLinks: {}
        });

        expect(room.getRoomStateData().staticCharacterList).toEqual([
            expect.objectContaining({ placement: null })
        ]);
    });

    it('mapSelect computes map placement tiles', async () => {

        const room = getRoom();

        await room.mapSelect({
            mapId: 'm1',
            name: 'm-1',
            nbrTeams: 3,
            nbrTeamCharacters: 3,
            schemaLink: 'foo',
            imagesLinks: {}
        });

        const { teamColorList, mapPlacementTiles } = room.getRoomStateData();

        expect(mapPlacementTiles).toEqual({
            [ teamColorList[ 0 ] ]: [
                createPosition(0, 0),
                createPosition(1, 1),
                createPosition(2, 2)
            ],
            [ teamColorList[ 1 ] ]: [
                createPosition(1, 0),
                createPosition(2, 1),
                createPosition(0, 2)
            ],
            [ teamColorList[ 2 ] ]: [
                createPosition(2, 0),
                createPosition(0, 1),
                createPosition(1, 2)
            ],
        });
    });

    it('waitForBattle wait for some time', async () => {
        const room = getRoom();

        const promiseState = await timerTester.waitTimer(room.waitForBattle());

        expect(promiseState).toEqual('completed');
    });

    it('createBattle give new battle', async () => {
        (createBattle as unknown as jest.MockInstance<any, any>).mockImplementation(createFakeBattle);

        const room = getRoom();

        await room.mapSelect({
            mapId: 'm1',
            name: 'm-1',
            nbrTeams: 3,
            nbrTeamCharacters: 4,
            schemaLink: 'foo',
            imagesLinks: {}
        });

        const battle = await room.createBattle();

        expect(battle).toEqual(expect.objectContaining({ battleId: expect.any(String) }));
    });

    it('playerJoin cancel battle waiting if any', async () => {
        const room = getRoom();

        const promise = room.waitForBattle();

        room.playerJoin({
            playerId: 'p4',
            playerName: 'p-4',
            ready: false,
            teamColor: ''
        });

        const promiseState = await timerTester.waitTimer(promise);

        expect(promiseState).toEqual('canceled');
    });

    it('playerLeave cancel battle launch if any', async () => {
        const room = getRoom();

        const promise = room.waitForBattle();

        room.playerLeave('p1');

        const promiseState = await timerTester.waitTimer(promise);

        expect(promiseState).toEqual('canceled');
    });

    it('playerReady cancel battle launch if any', async () => {
        const room = getRoom();

        room.playerJoin({
            playerId: 'p1',
            playerName: '',
            ready: false,
            teamColor: ''
        });

        const promise = room.waitForBattle();

        room.playerReady('p1', false);

        const promiseState = await timerTester.waitTimer(promise);

        expect(promiseState).toEqual('canceled');
    });
});
