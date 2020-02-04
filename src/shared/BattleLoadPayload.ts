import { MapInfos } from "./MapInfos";
import { CharacterType } from "./Character";
import { SpellType } from "./Spell";
import { PlayerInfos } from "./PlayerInfos";

export interface BattleLoadPayload {

    playerInfos: PlayerInfos;
    
    mapInfos: MapInfos;

    characterTypes: CharacterType[];

    spellTypes: SpellType[];
}