import { TeamRoom, PlayerRoom, RoomServerAction } from '@timeflies/shared';
import { Reducer } from 'redux';
import { GameAction } from '../../../../action/game-action/GameAction';
import { StageChangeAction } from '../../../../stages/StageManager';

export interface EntityTreeData {
    teamList: TeamRoom[];
    playerList: PlayerRoom[];
}

const initialState: EntityTreeData = {
    teamList: [],
    playerList: []
};

type SubReducer<A> = (state: EntityTreeData, action: A) => EntityTreeData;

const reduceRoomState: SubReducer<StageChangeAction<'room'>> = (state, {
    payload: { roomState: { playerList, teamList } }
}) => {
    return {
        playerList,
        teamList
    };
};

const reduceMapSelect: SubReducer<RoomServerAction.MapSelect> = (state, message) => {
    return {
        playerList: message.playerList,
        teamList: message.teamList
    };
};

const reducePlayerSet: SubReducer<RoomServerAction.PlayerSet> = (state, message) => {

    const playerList: PlayerRoom[] = message.action === 'add'
        ? [ ...state.playerList, message.player ]
        : message.playerList;

    return {
        ...state,
        playerList,
        teamList: message.teamList
    };
};

const reducerPlayerRefresh: SubReducer<RoomServerAction.PlayerRefresh> = (state, message) => {
    const playerList = [ ...state.playerList ];
    const index = playerList.findIndex(p => p.id === message.player.id);

    playerList[ index ] = {
        ...playerList[ index ],
        ...message.player
    };

    return {
        ...state,
        playerList
    };
};

const reducerCharacterSet: SubReducer<RoomServerAction.CharacterSet> = (state, message) => {

    const playerList = state.playerList.map(p => {

        if(p.id === message.playerId) {
            return {
                ...p,
                characters: message.action === 'add'
                    ? [...p.characters, message.character]
                    : p.characters.filter(c => c.id !== message.characterId)
            };
        }

        return {...p};
    });

    return {
        ...state,
        playerList,
        teamList: message.teamList
    };
};

export const EntityTreeReducer: Reducer<EntityTreeData, GameAction> = (state = initialState, action) => {

    switch (action.type) {
        case 'stage/change':
            if (action.stageKey === 'room') {
                return reduceRoomState(state, action as StageChangeAction<'room'>);
            }
            break;

        case 'message/receive':
            const { message } = action;

            switch (message.type) {

                case 'room/map/select':
                    return reduceMapSelect(state, message);

                case 'room/player/set':
                    return reducePlayerSet(state, message);

                case 'room/player/refresh':
                    return reducerPlayerRefresh(state, message);

                case 'room/character/set':
                    return reducerCharacterSet(state, message);

            }
            break;
    }

    return { ...state };
};
