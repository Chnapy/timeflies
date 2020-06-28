import { createPosition, normalize, Normalized } from '@timeflies/shared';
import { seedStaticCharacter } from "../seedStaticCharacter";
import { Character } from "./Character";

export const seedCharacter = (charArgs?: Parameters<typeof seedStaticCharacter>[ 0 ], playerId?: string): Normalized<Character> => {
    const staticChars = seedStaticCharacter(charArgs);

    const result = staticChars.map<Character>((sc, i) => Character({
        id: sc.id,
        position: createPosition(0, 0)
    }, sc, playerId ?? 'p1'));

    return normalize(result);
};
