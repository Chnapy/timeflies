import { TeamRoom } from '@timeflies/shared';
import { Team } from "./Team";

const letterList = [ 'A', 'B', 'C', 'D', 'E' ] as const;

let id = 0;

export const seedTeam = (partialTeam: Partial<TeamRoom> = {}): Team => {
    id++;
    return Team({
        id: id.toString(),
        letter: letterList[ (id - 1) % letterList.length ],
        ...partialTeam
    });
};