import { MapConfig } from "./MapConfig";
import { PlayerInfos } from "./snapshot/PlayerSnapshot";
import { SpellType } from "./snapshot/SpellSnapshot";

export interface BattleLoadPayload {

    playerInfos: PlayerInfos;
    
    mapConfig: MapConfig;

    spellTypes: SpellType[];
}
