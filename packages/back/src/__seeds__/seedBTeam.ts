import { Team } from "../shared/Team";
import { BTeam } from "../battle/run/entities/BTeam";

let id = 0;
const SEED_TEAM = (): Team => {
    id++;
    return {
        id: id.toString(),
        name: 'sample_team_' + id,
        color: `#FF8844`,
        players: []
    };
};

export const seedBTeam = (partialTeam: Partial<Team> = {}): BTeam => {
    return new BTeam({
        ...SEED_TEAM(),
        ...partialTeam
    });
};