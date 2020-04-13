import { Character } from "./Character";
import { seedStaticCharacter } from "./seedStaticCharacter";
import { Player } from "./Player";
import { seedPlayer } from "./Player.seed";

export const seedCharacter = (charArgs?: Parameters<typeof seedStaticCharacter>[0], player?: (i: number) => Player): Character[] => {
    const staticChars = seedStaticCharacter(charArgs);

    const getBPlayer = player || (() => seedPlayer());

    const result = staticChars.map<Character>((sc,i) => Character(sc, getBPlayer(i)));

    return result;
};
