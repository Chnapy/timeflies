import { MapConfig } from "./MapConfig";
import { CharacterType } from "./snapshot/CharacterSnapshot";
import { SpellType } from "./snapshot/SpellSnapshot";
import { PlayerInfos } from "./snapshot/PlayerSnapshot";

export interface BattleLoadPayload {

    playerInfos: PlayerInfos;
    
    mapInfos: MapConfig;

    characterTypes: CharacterType[];

    spellTypes: SpellType[];
}
