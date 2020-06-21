import { TeamRoom, TeamSnapshot } from "@timeflies/shared";

export type Team = {
    id: string;
    letter: string;
};

export const teamToSnapshot = ({ id, letter }: Team): TeamSnapshot => ({
    id,
    letter
});

export const Team = ({ id, letter }: Pick<TeamRoom, 'id' | 'letter'>) => {

    return {
        id,
        letter
    };
};
