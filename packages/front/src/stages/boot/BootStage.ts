import { RoomServerAction } from '@timeflies/shared';
import { CurrentPlayer } from '../../CurrentPlayer';
import { serviceDispatch } from '../../services/serviceDispatch';
import { serviceEvent } from '../../services/serviceEvent';
import { serviceNetwork } from '../../services/serviceNetwork';
import { LoginSuccess } from '../../ui/reducers/current-player-reducer';
import { StageCreator, StageParam } from '../StageManager';
import { StageChangeAction } from '../stage-actions';

export type BootStageParam = StageParam<'boot', {}>;

export const BootStage: StageCreator<'boot', never> = () => {

    return {
        async preload() {
            return {};
        },
        async create(assets, setupStageGraphic) {

            const { onMessageAction } = serviceEvent();

            const { dispatchStageChangeToRoom } = serviceDispatch({
                dispatchCurrentPlayer: (currentPlayer: CurrentPlayer): LoginSuccess => ({
                    type: 'login/success',
                    currentPlayer
                }),
                dispatchStageChangeToRoom: (roomState: RoomServerAction.RoomState): StageChangeAction<'room'> => StageChangeAction({
                    stageKey: 'room',
                    data: {
                        roomState
                    }
                })
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

            onMessageAction<RoomServerAction.RoomState>('room/state', action => {
                dispatchStageChangeToRoom(action);
            });

            sendMatchmakerEnter();

            setupStageGraphic({});
        }
    };
};