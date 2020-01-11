import { MapInfos } from "./MapInfos";
import { CharacterType } from "./Character";
import { SpellType } from "./Spell";

export interface BattleLoadPayload {
    
    mapInfos: MapInfos;

    characterTypes: CharacterType[];

    spellTypes: SpellType[];
}