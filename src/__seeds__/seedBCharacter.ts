import { BCharacter } from "../battle/run/entities/BCharacter";
import { seedStaticCharacter } from "./seedStaticCharacter";
import { BPlayer } from "../battle/run/entities/BPlayer";
import { seedBPlayer } from "./seedBPlayer";

export const seedBCharacter = (charArgs?: Parameters<typeof seedStaticCharacter>[0], player?: (i: number) => BPlayer): BCharacter[] => {
    const staticChars = seedStaticCharacter(charArgs);

    const getBPlayer = player || (() => seedBPlayer());

    const result = staticChars.map<BCharacter>((sc,i) => new BCharacter(sc, getBPlayer(i)));

    return result;
};
