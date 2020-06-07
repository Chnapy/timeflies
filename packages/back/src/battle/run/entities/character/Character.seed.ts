import { seedStaticCharacter } from "../seedStaticCharacter";
import { Character } from "./Character";

export const seedCharacter = (charArgs?: Parameters<typeof seedStaticCharacter>[0], playerId?: string): Character[] => {
    const staticChars = seedStaticCharacter(charArgs);

    const result = staticChars.map<Character>((sc,i) => Character({
        id: sc.id,
        position: {x: 0, y: 0}
    }, sc, playerId ?? 'p1'));

    return result;
};
