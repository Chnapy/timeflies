
export type PlayerCredentials = {
    id: string;
    token: string;
    playerName: string;
};

// TODO check with lib like yup
export const playerNameConstraints = {
    length: { min: 3, max: 12 }
} as const;
