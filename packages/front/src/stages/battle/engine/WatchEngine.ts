import { EngineCreator } from './Engine';

export const WatchEngine: EngineCreator<undefined, []> = () => {

    return {
        stop() {}
    };
};
