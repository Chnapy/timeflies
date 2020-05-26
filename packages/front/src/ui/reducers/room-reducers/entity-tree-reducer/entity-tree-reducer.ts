import { createReducer } from '@reduxjs/toolkit';
import { PlayerRoom, RoomServerAction, TeamRoom, assertIsDefined } from '@timeflies/shared';
import { ReceiveMessageAction } from '../../../../socket/wsclient-actions';
import { StageChangeAction, stageChangeActionPayloadMatch } from '../../../../stages/stage-actions';

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
    [ StageChangeAction.type ]: (state, { payload }: StageChangeAction) => {
        if (stageChangeActionPayloadMatch('room', payload)) {
            const { roomState: { playerList, teamList } } = payload.data;

            return {
                playerList,
                teamList
            };
        }
    },
    [ ReceiveMessageAction.type ]: (state, { payload }: ReceiveMessageAction) => {

        switch (payload.type) {

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

    if(message.action === 'add') {
        player.characters.push(message.character);
    } else {
        player.characters = player.characters.filter(c => c.id !== message.characterId)
    }

    state.teamList = message.teamList;
};
