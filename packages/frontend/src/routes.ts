
export const routes = {
    roomListPage: () => '/',
    roomPage: ({ roomId }: { roomId?: string }) => `/room/${roomId ?? ':roomId'}`,
    battlePage: ({ battleId }: { battleId?: string }) => `/battle/${battleId ?? ':battleId'}`
};
