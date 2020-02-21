import { BattleLoadSAction, MatchmakerEnterCAction, SetIDCAction } from '@timeflies/shared';
import { Controller } from '../../Controller';
import { CurrentPlayer } from '../../CurrentPlayer';
import { serviceDispatch } from '../../services/serviceDispatch';
import { serviceEvent } from '../../services/serviceEvent';
import { SendMessageAction } from '../../socket/WSClient';
import { LoginSuccess } from '../../ui/reducers/CurrentPlayerReducer';
import { LoadLaunchAction, LoadScene } from "../load/LoadScene";
import { BootScene } from "./BootScene";

export interface BootStage {

}

export const BootStage = (scene: Pick<BootScene, 'start'>): BootStage => {

    const { onAction, onMessageAction } = serviceEvent();

    const { setCurrentPlayer, sendSetID, sendMatchmakerEnter } = serviceDispatch({
        setCurrentPlayer: (currentPlayer: CurrentPlayer): LoginSuccess => ({
            type: 'login/success',
            currentPlayer
        }),
        sendSetID: (id: string): SendMessageAction<SetIDCAction> => ({
            type: 'message/send',
            message: {
                type: 'set-id',
                id
            }
        }),
        sendMatchmakerEnter: (): SendMessageAction<MatchmakerEnterCAction> => ({
            type: 'message/send',
            message: {
                type: 'matchmaker/enter'
            }
        })
    });

    onAction<LoadLaunchAction>('load/launch', ({
        payload
    }) => {
        setCurrentPlayer(payload.playerInfos);
        scene.start<LoadScene>('LoadScene', payload);
    });

    Controller.client.waitConnect().then(() => {

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

    });

    return {};
};