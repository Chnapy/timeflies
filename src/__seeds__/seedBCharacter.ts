import { BCharacter } from "../battle/run/entities/BCharacter";
import { seedStaticCharacter } from "./seedStaticCharacter";
import { BPlayer } from "../battle/run/entities/BPlayer";
import { seedBPlayer } from "./seedBPlayer";

export const seedBCharacter = (charArgs?: Parameters<typeof seedStaticCharacter>[0], player?: BPlayer): BCharacter[] => {
    const staticChars = seedStaticCharacter(charArgs);

    const bPlayer = player || seedBPlayer();

    const result = staticChars.map<BCharacter>(sc => new BCharacter(sc, bPlayer));

    return result;
};
