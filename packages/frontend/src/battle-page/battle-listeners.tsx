import { useNotifyListener } from './spell-action/hooks/use-notify-listener';
import { usePlayerDisconnectListener } from './player-disconnect/hooks/use-player-disconnect-listener';

export const BattleListeners: React.FC = () => {
    useNotifyListener();
    usePlayerDisconnectListener();

    return null;
};
