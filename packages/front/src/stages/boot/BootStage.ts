import { BattleLoadPayload, BattleLoadSAction } from '@timeflies/shared';
import { Controller } from '../../Controller';
import { CurrentPlayer } from '../../CurrentPlayer';
import { serviceDispatch } from '../../services/serviceDispatch';
import { serviceEvent } from '../../services/serviceEvent';
import { serviceNetwork } from '../../services/serviceNetwork';
import { LoginSuccess } from '../../ui/reducers/CurrentPlayerReducer';
import { LoadLaunchAction } from "../load/LoadScene";
import { StageChangeAction, StageCreator, StageParam } from '../StageManager';

export type BootStageParam = StageParam<'boot', {}>;

export const BootStage: StageCreator<'boot', never> = () => {

    return {
        preload() {
            return {}
        },
        async create() {

            const { onAction, onMessageAction } = serviceEvent();

            const { dispatchCurrentPlayer, dispatchStageChangeToLoad } = serviceDispatch({
                dispatchCurrentPlayer: (currentPlayer: CurrentPlayer): LoginSuccess => ({
                    type: 'login/success',
                    currentPlayer
                }),
                dispatchStageChangeToLoad: (payload: BattleLoadPayload): StageChangeAction<'load'> => ({
                    type: 'stage/change',
                    stageKey: 'load',
                    payload
                })
            });

            onAction<LoadLaunchAction>('load/launch', ({
                payload
            }) => {
                dispatchCurrentPlayer(payload.playerInfos);
                dispatchStageChangeToLoad(payload);
            });

            const { sendSetID, sendMatchmakerEnter } = await serviceNetwork({
                sendSetID: (id: string) => ({
                    type: 'set-id',
                    id
                }),
                sendMatchmakerEnter: () => ({
                    type: 'matchmaker/enter'
                })
            });

            sendSetID(Math.random() + '');

            onMessageAction<BattleLoadSAction>('battle-load', ({
                payload
            }) => {

                Controller.dispatch<LoadLaunchAction>({
                    type: 'load/launch',
                    payload
                });

            });

            sendMatchmakerEnter();
        }
    };
};