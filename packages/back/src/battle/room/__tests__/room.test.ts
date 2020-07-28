import { RoomTester } from './room-tester';
import { RoomOpenState } from '@timeflies/shared';

describe('# room', () => {

    const { createPlayer, createRoomWithCreator, getRoomStateWithMap } = RoomTester;

    describe('should not be open if', () => {

        it('no map selected', () => {
            const { room } = createRoomWithCreator('p1');

            expect(room.getOpenState()).toBe<RoomOpenState>('no-map');
        });

        it('nbr players equals or more than map nbr teams times nbr characters per team', () => {

            const { createRoom, mapConfig, initialState } = getRoomStateWithMap('p1', 'p2', 'm1', 2);

            const { playerDataList, playerList } = initialState;

            const nbrPlayersMax = mapConfig.nbrTeams * mapConfig.nbrCharactersPerTeam;

            [ ...new Array(nbrPlayersMax - 2) ]
                .map((_, i) => createPlayer(`p${i + 2}`, false))
                .forEach(({ playerData, player }) => {
                    playerDataList!.push(playerData);
                    playerList!.push(player);
                });

            const room = createRoom();

            expect(room.getOpenState()).toBe<RoomOpenState>('players-full');
        });

        it('room step is will-launch', () => {
            const { createRoom, initialState } = getRoomStateWithMap('p1', 'p2', 'm1', 2);
    
            initialState.step = 'will-launch';

            const room = createRoom();
    
            expect(room.getOpenState()).toBe<RoomOpenState>('in-battle');
        });

        it('room step is battle', () => {
            const { createRoom, initialState } = getRoomStateWithMap('p1', 'p2', 'm1', 2);
    
            initialState.step = 'battle';

            const room = createRoom();
    
            expect(room.getOpenState()).toBe<RoomOpenState>('in-battle');
        });
    });

    it('should be open if map selected and not full of players', () => {

        const { createRoom } = getRoomStateWithMap('p1', 'p2', 'm1', 2);

        const room = createRoom();

        expect(room.getOpenState()).toBe<RoomOpenState>('open');
    });
});
