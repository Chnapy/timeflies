import { StageCreator, StageParam } from '../StageManager';


export type RoomStageParam = StageParam<'room', {}>;

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
