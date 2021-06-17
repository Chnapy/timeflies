import { useLoginSelector } from './use-login-selector';

export const useMyPlayerId = () => useLoginSelector(state => state.playerId);
