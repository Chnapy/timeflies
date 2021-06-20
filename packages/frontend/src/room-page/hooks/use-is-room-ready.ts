import { useRoomSelector } from './use-room-selector';

export const useIsRoomReady = () => useRoomSelector(state => {
    const playerList = Object.values(state.staticPlayerList)
        .filter(player => player.type === 'player');

    return playerList.length > 0 && playerList.every(player => player.ready);
});
