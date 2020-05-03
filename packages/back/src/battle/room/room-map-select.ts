import { assertIsDefined, MapConfig, MapPlacementTile, PlayerRoom, RoomClientAction, RoomServerAction, TeamRoom, TiledManager } from '@timeflies/shared';
import { RoomListener } from './room';
import { RoomState } from './room-state-manager';

const teamLetters: readonly string[] = [ 'A', 'B', 'C', 'D', 'E' ];

const createTeamList = ({ nbrTeams }: MapConfig): TeamRoom[] => {
    return [ ...new Array(nbrTeams) ]
        .map((_, i) => teamLetters[ i ])
        .map((letter): TeamRoom => ({
            id: letter,
            letter,
            playersIds: []
        }));
};

export const getRoomMapSelect: RoomListener<RoomClientAction.MapSelect> = ({
    stateManager, sendToEveryone, dataManager, readFileMap, getPlayerRoom
}) => async ({ mapId }) => {

    const playerRoom = getPlayerRoom();

    if (!playerRoom.isAdmin) {
        // TODO manage error
        throw new Error();
    }

    if (playerRoom.isReady) {
        // TODO manage error
        throw new Error();
    }

    const map = dataManager.getMapConfigList()
        .find(m => m.id === mapId);
    assertIsDefined(map);

    const teamList = createTeamList(map);

    const schemaUrlServer = dataManager.urlTransform(map.schemaUrl).forServer();

    const schema = await readFileMap(schemaUrlServer);

    const tiledManager = TiledManager({
        schema,
        images: {}
    });

    const placementTileList: MapPlacementTile[] = tiledManager.getPlacementTilesPositions()
        .flatMap((positionList, i) => {
            const team = teamList[ i ];
            assertIsDefined(team);

            return positionList.map((position): MapPlacementTile => ({
                teamId: team.id,
                position
            }));
        });

    const mapSelected: RoomState[ 'mapSelected' ] = {
        config: map,
        placementTileList
    };

    const mutable = stateManager.clone('playerList');

    const playerList: PlayerRoom[] = mutable.playerList.map(p => ({
        ...p,
        isReady: false,
        characters: []
    }));

    stateManager.set({
        mapSelected,
        teamList,
        playerList
    });

    sendToEveryone<RoomServerAction.MapSelect>({
        type: 'room/map/select',
        mapSelected: {
            id: map.id,
            placementTileList
        },
        teamList,
        playerList
    });
};
