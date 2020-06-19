import { TeamSnapshot } from '@timeflies/shared';

export type Team = {
    id: string;
    letter: string;
};

export const teamToSnapshot = ({ id, letter }: Team): TeamSnapshot => {
    return {
        id,
        letter
    };
};

export const Team = (
    { id, letter }: TeamSnapshot
): Team => {

    return {
        id,
        letter
    };
};
