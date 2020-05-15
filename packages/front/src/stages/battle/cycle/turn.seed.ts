import { Turn } from './Turn';
import { seedCharacter } from '../entities/character/Character.seed';
import { assignKeepGetSet } from '@timeflies/shared';

export const seedTurn = (id: number, partial: Partial<Turn> = {}): Turn => assignKeepGetSet({
    id,
    state: 'running',
    startTime: -1,
    endTime: -1,
    turnDuration: -1,
    currentSpellType: 'move',
    character: seedCharacter('fake', {
        id: 'c1', period: 'current', player: null
    }),
    getRemainingTime(period) { return -1 },
    refreshTimedActions() { },
    synchronize(snapshot) { },
}, partial);
