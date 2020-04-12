import { MapConfig } from "../map/MapConfig";
import { PlayerInfos } from "../entities/Player";
import { SpellType } from "../entities/Spell";

export interface BattleLoadPayload {

    playerInfos: PlayerInfos;
    
    mapConfig: MapConfig;

    spellTypes: SpellType[];
}
