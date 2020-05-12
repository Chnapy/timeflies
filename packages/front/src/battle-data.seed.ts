import { BattleDataMap } from './BattleData';
import { seedGlobalTurn } from './stages/battle/cycle/global-turn.seed';

export const seedBattleData = (partial: Partial<BattleDataMap> = {}): BattleDataMap => ({
    cycle: {
        launchTime: -1,
        globalTurn: seedGlobalTurn(1)
    },
    current: {
        battleHash: '',
        characters: [],
        players: [],
        teams: []
    },
    future: {
        battleHash: '',
        characters: [],
        players: [],
        teams: [],
        spellActionSnapshotList: []
    },
    ...partial
});
