import { useRoomSelector } from './use-room-selector';

export const useIsRoomReady = () => useRoomSelector(state => Object.values(state.staticPlayerList).every(player => player.ready));
