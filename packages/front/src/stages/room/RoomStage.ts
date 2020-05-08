import { StageCreator, StageParam } from '../StageManager';
import { RoomServerAction } from '@timeflies/shared';


export type RoomStageParam = StageParam<'room', {
    roomState: RoomServerAction.RoomState;
}>;

export const RoomStage: StageCreator<'room', never> = (payload) => {

    return {
        async preload() {
            return {};
        },
        async create(assets, setupStageGraphic) {

            setupStageGraphic({});
        }
    };
};
