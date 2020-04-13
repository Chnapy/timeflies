import { Team } from "./Team";
import { TeamData } from "../../../Team";

let id = 0;
const SEED_TEAM = (): TeamData => {
    id++;
    return {
        id: id.toString(),
        name: 'sample_team_' + id,
        color: `#FF8844`,
        players: []
    };
};

export const seedTeam = (partialTeam: Partial<TeamData> = {}): Team => {
    return Team({
        ...SEED_TEAM(),
        ...partialTeam
    });
};