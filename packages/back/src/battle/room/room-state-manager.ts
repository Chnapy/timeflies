import { clone, DeepReadonly, MapConfig, MapPlacementTile, PlayerRoom, TeamRoom } from '@timeflies/shared';
import { PlayerRoomDataConnected } from './room';
import { BattleRunRoom } from '../run/BattleRunRoom';

type RoomStateStep = 'idle' | 'will-launch' | 'battle';

export type RoomState = {
    id: string;
    step: RoomStateStep;
    playerDataList: PlayerRoomDataConnected[];
    playerList: PlayerRoom[];
    teamList: TeamRoom[];
    mapSelected: {
        config: MapConfig;
        placementTileList: MapPlacementTile[];
    } | null;
    launchTimeout: NodeJS.Timeout | null;
    battle: BattleRunRoom | null;
};

type RoomStateClone = Omit<RoomState, 'playerDataList' | 'launchTimeout' | 'battle'>;

export type RoomStateManager = ReturnType<typeof RoomStateManager>;

export const RoomStateManager = (id: string, initialState: Partial<RoomState>) => {

    const cloneFn = <K extends keyof RoomStateClone>(...keys: K[]): Pick<RoomStateClone, K> => {

        return keys.reduce((acc, k) => {

            acc[ k ] = clone(state[ k ] as any) as any;

            return acc;
        }, {} as Pick<RoomStateClone, K>);
    };

    let state: DeepReadonly<RoomState> = {
        id,
        step: 'idle',
        playerDataList: [],
        playerList: [],
        teamList: [],
        mapSelected: null,
        launchTimeout: null,
        battle: null,
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
