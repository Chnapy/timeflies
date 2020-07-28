import { createReducer } from '@reduxjs/toolkit';
import { assertIsDefined, PlayerRoom, RoomServerAction, TeamRoom } from '@timeflies/shared';
import { ReceiveMessageAction } from '../../../../socket/wsclient-actions';
import { RoomStartAction } from '../room-actions';

export interface EntityTreeData {
    teamList: TeamRoom[];
    playerList: PlayerRoom[];
}

const initialState: EntityTreeData = {
    teamList: [],
    playerList: []
};

type SubReducer<A> = (state: EntityTreeData, action: A) => EntityTreeData | void;

export const entityTreeReducer = createReducer(initialState, {

    // TODO consider remove
    [ RoomStartAction.type ]: (state, { payload }: RoomStartAction) => {
        const { playerList, teamList } = payload.roomState;

        return {
            playerList,
            teamList
        };
    },
    [ ReceiveMessageAction.type ]: (state, { payload }: ReceiveMessageAction) => {

        switch (payload.type) {

            case 'room/state':
                const { playerList, teamList } = payload;

                return {
                    playerList,
                    teamList
                };

            case 'room/map/select':
                return reduceMapSelect(state, payload);

            case 'room/player/set':
                return reducePlayerSet(state, payload);

            case 'room/player/refresh':
                return reducerPlayerRefresh(state, payload);

            case 'room/character/set':
                return reducerCharacterSet(state, payload);

        }
    }
});

const reduceMapSelect: SubReducer<RoomServerAction.MapSelect> = (state, message) => {
    return {
        playerList: message.playerList,
        teamList: message.teamList
    };
};

const reducePlayerSet: SubReducer<RoomServerAction.PlayerSet> = (state, message) => {

    if (message.action === 'add') {
        state.playerList.push(message.player);
    } else {
        state.playerList = message.playerList;
    }

    state.teamList = message.teamList;
};

const reducerPlayerRefresh: SubReducer<RoomServerAction.PlayerRefresh> = (state, message) => {
    const player = state.playerList.find(p => p.id === message.player.id);
    assertIsDefined(player);
    Object.assign(player, message.player);
};

const reducerCharacterSet: SubReducer<RoomServerAction.CharacterSet> = (state, message) => {
    const player = state.playerList.find(p => p.id === message.playerId);
    assertIsDefined(player);

    if (message.action === 'add') {
        player.characters.push(message.character);
    } else {
        player.characters = player.characters.filter(c => c.id !== message.characterId)
    }

    state.teamList = message.teamList;
};
