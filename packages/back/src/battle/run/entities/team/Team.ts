import { TeamEntity, TeamRoom } from "@timeflies/shared";

// should not use entity directly, for future updates
export type Team = TeamEntity;

export const Team = ({ id, letter }: Pick<TeamRoom, 'id' | 'letter'>) => {

    return {
        id,
        letter
    };
};
