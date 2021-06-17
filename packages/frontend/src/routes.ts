import { RouteProps } from 'react-router-dom';

type RouteInfos = Omit<RouteProps, 'path'> & { path: string };

export const routes = {
    roomListPage: (): RouteInfos => ({ path: '/', exact: true }),
    roomPage: ({ roomId }: { roomId?: string }): RouteInfos => ({ path: `/room/${roomId ?? ':roomId'}` }),
    battlePage: ({ battleId }: { battleId?: string }): RouteInfos => ({ path: `/battle/${battleId ?? ':battleId'}` })
};
