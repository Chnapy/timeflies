import { createReducer } from '@reduxjs/toolkit';
import { CurrentPlayer } from "../../CurrentPlayer";
import { StageChangeAction, stageChangeActionPayloadMatch } from '../../stages/stage-actions';

export const currentPlayerReducer = createReducer(null as CurrentPlayer | null, {
    [ StageChangeAction.type ]: (state, { payload }: StageChangeAction) => {
        if (stageChangeActionPayloadMatch('room', payload)) {
            const { roomState: { playerList } } = payload.data;
            const p = playerList[ playerList.length - 1 ];

            return {
                id: p.id,
                name: p.name
            };
        }
    }
});
