import { EngineCreator } from './Engine';

export interface WatchEngine {
}

export const WatchEngine: EngineCreator<undefined, []> = (): WatchEngine => {

    return {};
};
