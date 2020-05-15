import { GlobalTurn } from './GlobalTurn';
import { seedTurn } from './turn.seed';
import { assignKeepGetSet } from '@timeflies/shared';

export const seedGlobalTurn = (id: number, partial: Partial<GlobalTurn> = {}): GlobalTurn => assignKeepGetSet({
    id,
    state: 'running',
    notifyDeaths() { },
    start() { },
    stop() { },
    synchronize(snapshot) { },
    synchronizeTurn(turnSnapshot) { },
    currentTurn: seedTurn(1),
}, partial);
