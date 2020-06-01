
export type TeamSnapshot = {
    id: string;
    letter: string;
};

export interface TeamRoom {
    id: string;
    letter: string;
    playersIds: string[];
}
