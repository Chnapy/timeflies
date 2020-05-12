import { GlobalTurn } from './GlobalTurn';
import { seedTurn } from './turn.seed';

export const seedGlobalTurn = (id: number, partial: Partial<GlobalTurn> = {}): GlobalTurn => ({
    id,
    state: 'running',
    notifyDeaths() {},
    start() {},
    stop() {},
    synchronize(snapshot) {},
    synchronizeTurn(turnSnapshot) {},
    currentTurn: seedTurn(1),
    ...partial
});
