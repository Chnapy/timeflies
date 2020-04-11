import { BattleLoadPayload, BattleLoadSAction } from '@timeflies/shared';
import { CurrentPlayer } from '../../CurrentPlayer';
import { serviceDispatch } from '../../services/serviceDispatch';
import { serviceEvent } from '../../services/serviceEvent';
import { serviceNetwork } from '../../services/serviceNetwork';
import { LoginSuccess } from '../../ui/reducers/CurrentPlayerReducer';
import { LoadLaunchAction } from "../load/LoadStage";
import { StageChangeAction, StageCreator, StageParam } from '../StageManager';

export type BootStageParam = StageParam<'boot', {}>;

export const BootStage: StageCreator<'boot', never> = () => {

    return {
        async preload() {
            return {};
        },
        async create(assets, setupStageGraphic) {

            const { onAction, onMessageAction } = serviceEvent();

            const { dispatchCurrentPlayer, dispatchStageChangeToLoad, dispatchLoadLaunch } = serviceDispatch({
                dispatchCurrentPlayer: (currentPlayer: CurrentPlayer): LoginSuccess => ({
                    type: 'login/success',
                    currentPlayer
                }),
                dispatchStageChangeToLoad: (payload: BattleLoadPayload): StageChangeAction<'load'> => ({
                    type: 'stage/change',
                    stageKey: 'load',
                    payload
                }),
                dispatchLoadLaunch: (payload: BattleLoadPayload): LoadLaunchAction => ({
                    type: 'load/launch',
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

                dispatchLoadLaunch(payload);
            });

            sendMatchmakerEnter();

            setupStageGraphic({});
        }
    };
};