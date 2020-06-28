import { TeamEntity, TeamSnapshot } from '@timeflies/shared';

// should not use entity directly, for future updates
export type Team = TeamEntity;

export const Team = (
    { id, letter }: TeamSnapshot
): Team => {

    return {
        id,
        letter
    };
};
