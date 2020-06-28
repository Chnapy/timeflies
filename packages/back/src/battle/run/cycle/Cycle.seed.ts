import { seedCharacter } from '../entities/character/Character.seed';
import { Cycle } from './Cycle';
import { GlobalTurn } from './turn/GlobalTurn';
import { Turn } from './turn/Turn';

interface SeedCycleProps {
    globalTurn?: Partial<GlobalTurn>;
    turn?: Partial<Turn>;
}

export const seedCycle = ({ globalTurn, turn }: SeedCycleProps = {}): Cycle => ({
    start() { },
    stop() { },
    globalTurn: {
        id: -1,
        startTime: -1,
        state: 'running',
        currentTurn: {
            id: -1,
            getCharacter: () => seedCharacter()[ '1' ],
            clearTimedActions() { },
            endTime: -1,
            refreshTimedActions() { },
            startTime: -1,
            state: 'running',
            toSnapshot() { return null as any },
            turnDuration: -1,
            ...turn
        },
        stop() { },
        toSnapshot() { return null as any },
        notifyDeaths() { },
        ...globalTurn
    }
});
