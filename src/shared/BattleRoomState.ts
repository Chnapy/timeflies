import { CharacterType } from "./Character";
import { MapInfos } from "./MapInfos";
import { SpellType } from "./Spell";
import { TeamSnapshot } from "./Team";


export interface BattleSnapshot {

    teamsSnapshots: TeamSnapshot[];
}

export interface BattleRoomState {

    mapInfos: MapInfos;

    characterTypes: CharacterType[];

    spellTypes: SpellType[];

    battleSnapshot: BattleSnapshot;
}

