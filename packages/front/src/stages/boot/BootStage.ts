import { BattleLoadSAction } from '@timeflies/shared';
import { Controller } from '../../Controller';
import { CurrentPlayer } from '../../CurrentPlayer';
import { serviceDispatch } from '../../services/serviceDispatch';
import { serviceEvent } from '../../services/serviceEvent';
import { serviceNetwork } from '../../services/serviceNetwork';
import { LoginSuccess } from '../../ui/reducers/CurrentPlayerReducer';
import { LoadLaunchAction, LoadScene } from "../load/LoadScene";
import { BootScene } from "./BootScene";

export interface BootStage {

}

export const BootStage = (scene: Pick<BootScene, 'start'>): BootStage => {

    const { onAction, onMessageAction } = serviceEvent();

    const { setCurrentPlayer } = serviceDispatch({
        setCurrentPlayer: (currentPlayer: CurrentPlayer): LoginSuccess => ({
            type: 'login/success',
            currentPlayer
        })
    });

    onAction<LoadLaunchAction>('load/launch', ({
        payload
    }) => {
        setCurrentPlayer(payload.playerInfos);
        scene.start<LoadScene>('LoadScene', payload);
    });

    serviceNetwork({
        sendSetID: (id: string) => ({
            type: 'set-id',
            id
        }),
        sendMatchmakerEnter: () => ({
            type: 'matchmaker/enter'
        })
    }).then(({ sendSetID, sendMatchmakerEnter }) => {

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