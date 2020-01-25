import { BCharacter } from "../../shared/Character";
import { seedStaticCharacter } from "./seedStaticCharacter";
import { BPlayer } from "../../shared/Player";
import { seedBPlayer } from "./seedBPlayer";

export const seedBCharacter = (charArgs: Parameters<typeof seedStaticCharacter>, player?: BPlayer): BCharacter[] => {
    const staticChars = seedStaticCharacter(...charArgs);

    const bPlayer = player || seedBPlayer();

    const result = staticChars.map<BCharacter>(sc => new BCharacter(sc, bPlayer));

    return result;
};
