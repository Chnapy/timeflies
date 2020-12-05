import { Position, Orientation } from '../geo';

export type CharacterId = string;

export type CharacterDuration = number;

export type CharacterRole = typeof characterRoleList[ number ];
export const characterRoleList = [
    'vemo', 'tacka', 'meti'
] as const;

export type CharacterVariables = {
    life: number;
    actionTime: number;
    position: Position;
    orientation: Orientation;
};

export module CharacterUtils {
    export const isAlive = (life: number) => life > 0;
}
