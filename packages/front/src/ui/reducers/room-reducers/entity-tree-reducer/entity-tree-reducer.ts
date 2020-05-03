import { TeamRoom, PlayerRoom, assertIsDefined, RoomServerAction } from '@timeflies/shared';
import { Reducer } from 'redux';
import { GameAction } from '../../../../action/game-action/GameAction';

export interface EntityTreeData {
    teamList: TeamRoom[];
    playerList: PlayerRoom[];
}

const initialState: EntityTreeData = {
    teamList: [],
    playerList: []
};

type SubReducer<A> = (state: EntityTreeData, action: A) => EntityTreeData;

const reduceMapState: SubReducer<RoomServerAction.RoomState> = (state, message) => {
    return {
        playerList: message.playerList,
        teamList: message.teamList
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
        ? [...state.playerList, message.player]
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
    const player = state.playerList.find(p => p.id === message.playerId);
    assertIsDefined(player);

    if (message.action === 'add') {
        player.characters.push(message.character);
    } else {
        player.characters.splice(
            player.characters.findIndex(c => c.id === message.characterId),
            1
        );
    }

    return {
        ...state,
        teamList: message.teamList
    };
};

export const EntityTreeReducer: Reducer<EntityTreeData, GameAction> = (state = initialState, action) => {

    switch (action.type) {
        case 'message/receive':
            const { message } = action;

            switch (message.type) {

                case 'room/state':
                    return reduceMapState(state, message);

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
