import { Player } from "../player/Player";
import { seedPlayer } from "../player/Player.seed";
import { seedStaticCharacter } from "../seedStaticCharacter";
import { Character } from "./Character";

export const seedCharacter = (charArgs?: Parameters<typeof seedStaticCharacter>[0], player?: (i: number) => Player): Character[] => {
    const staticChars = seedStaticCharacter(charArgs);

    const getBPlayer = player || (() => seedPlayer());

    const result = staticChars.map<Character>((sc,i) => Character(sc, {x: 0, y: 0}, getBPlayer(i)));

    return result;
};
