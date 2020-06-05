import { RoomServerAction } from '@timeflies/shared';
import { RoomStartAction } from '../../ui/reducers/room-reducers/room-actions';

export type BootStageParam = StageParam<'boot', {}>;

export const BootStage: StageCreator<'boot', never> = () => {

    return {
        async preload() {
            return {};
        },
        async create(assets, setupStageGraphic) {

            const { onMessageAction } = serviceEvent();

            const { dispatchStageChangeToRoom } = serviceDispatch({
                dispatchStageChangeToRoom: (roomState: RoomServerAction.RoomState) => RoomStartAction({
                    roomState
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