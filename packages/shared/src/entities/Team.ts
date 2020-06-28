
export type TeamEntity = {
    id: string;
    letter: string;
};

export type TeamSnapshot = {
    id: string;
    letter: string;
};

export type TeamRoom = {
    id: string;
    letter: string;
    playersIds: string[];
};

export const teamEntityToSnapshot = ({ id, letter }: TeamEntity): TeamSnapshot => ({
    id,
    letter
});
