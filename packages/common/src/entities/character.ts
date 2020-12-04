
export type CharacterId = string;

export type CharacterDuration = number;

export type CharacterRole = typeof characterRoleList[ number ];
export const characterRoleList = [
    'vemo', 'tacka', 'meti'
] as const;

export module CharacterUtils {
    export const isAlive = (life: number) => life > 0;
}
