import { useGameSelector } from '../../store/hooks/use-game-selector';
import { RoomState } from '../store/room-reducer';

export const useRoomSelector = <R>(selector: (roomState: RoomState) => R) => {
    return useGameSelector(state => {
        if (!state.room) {
            throw new Error('no room state')
        }
        return selector(state.room);
    });
};
