import { Team } from "./Team";
import { TeamData } from "../../../../TeamData";

const letterList = [ 'A', 'B', 'C', 'D', 'E' ] as const;

let id = 0;
const SEED_TEAM = (): TeamData => {
    id++;
    return {
        id: id.toString(),
        letter: letterList[ (id - 1) % letterList.length ],
        players: []
    };
};

export const seedTeam = (partialTeam: Partial<TeamData> = {}): Team => {
    return Team({
        ...SEED_TEAM(),
        ...partialTeam
    });
};