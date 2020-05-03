import { MapConfig } from "../map/MapConfig";
import { PlayerInfos } from "../entities/Player";

export interface BattleLoadPayload {

    playerInfos: PlayerInfos;
    
    mapConfig: MapConfig;
}
