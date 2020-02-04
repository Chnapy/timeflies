import { MapInfos } from "./MapInfos";
import { CharacterType } from "./snapshot/CharacterSnapshot";
import { SpellType } from "./snapshot/SpellSnapshot";
import { PlayerInfos } from "./snapshot/PlayerSnapshot";

export interface BattleLoadPayload {

    playerInfos: PlayerInfos;
    
    mapInfos: MapInfos;

    characterTypes: CharacterType[];

    spellTypes: SpellType[];
}
