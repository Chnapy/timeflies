import { clone, DeepReadonly, MapConfig, MapPlacementTile, PlayerRoom, TeamRoom } from '@timeflies/shared';
import { PlayerRoomDataConnected } from './room';

export type RoomState = {
    playerDataList: PlayerRoomDataConnected[];
    playerList: PlayerRoom[];
    teamList: TeamRoom[];
    mapSelected: {
        config: MapConfig;
        placementTileList: MapPlacementTile[];
    } | null;
};

type RoomStateClone = Omit<RoomState, 'playerDataList'>;

export type RoomStateManager = ReturnType<typeof RoomStateManager>;

export const RoomStateManager = (initialState: Partial<RoomState>) => {

    const cloneFn = <K extends keyof RoomStateClone>(...keys: K[]): Pick<RoomStateClone, K> => {

        return keys.reduce((acc, k) => {

            acc[ k ] = clone(state[ k ] as any) as any;

            return acc;
        }, {} as Pick<RoomStateClone, K>);
    };

    let state: DeepReadonly<RoomState> = {
        playerDataList: [],
        playerList: [],
        teamList: [],
        mapSelected: null,
        ...initialState
    };

    return {
        get: (): DeepReadonly<RoomState> => state,
        clone: cloneFn,
        set: (newState: Partial<RoomState>): void => {
            state = {
                ...state,
                ...newState
            };
        },
        setFn: (fn: (oldState: DeepReadonly<RoomState>) => Partial<DeepReadonly<RoomState>>): void => {
            state = {
                ...state,
                ...fn(state)
            };
        }
    };
};
