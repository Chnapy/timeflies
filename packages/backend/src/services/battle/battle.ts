import { CharacterId, createId, PlayerId, SerializableState, SpellId, StaticCharacter, StaticPlayer, StaticSpell } from '@timeflies/common';
import { CycleEngine, TurnInfos } from '@timeflies/cycle-engine';
import { MapInfos, RoomEntityListGetMessageData, RoomStaticCharacter, RoomStaticPlayer } from '@timeflies/socket-messages';
import type TiledMap from 'tiled-types';
import { GlobalEntities } from '../../main/global-entities';
import { PartialCycleBattle } from './cycle/cycle-battle-service';
import { getBattleStaticData } from './get-battle-static-data';

export type BattlePayload = {
    roomId: string;
    entityListData: RoomEntityListGetMessageData;
    staticPlayerList: RoomStaticPlayer[];
    staticCharacterList: RoomStaticCharacter[];
    mapInfos: MapInfos;
    tiledMap: TiledMap;
};

export type BattleId = string;

export type StaticState = {
    players: { [ playerId in PlayerId ]: StaticPlayer };
    characters: { [ characterId in CharacterId ]: StaticCharacter };
    spells: { [ spellId in SpellId ]: StaticSpell };
};

type DisconnectedPlayers = { [ playerId in PlayerId ]?: number };

export type CycleInfos = {
    turnsOrder: CharacterId[];
};

export type Battle = {
    battleId: BattleId;
    roomId: string;

    playerIdList: Set<PlayerId>;
    staticPlayers: StaticPlayer[];
    staticCharacters: StaticCharacter[];
    staticSpells: StaticSpell[];

    mapInfos: MapInfos;
    tiledMap: TiledMap;
    staticState: StaticState;

    waitingPlayerList: Set<PlayerId>;
    disconnectedPlayers: DisconnectedPlayers;
    leavedPlayers: Set<PlayerId>;

    stateStack: SerializableState[];

    cycleEngine: CycleEngine;
    cycleInfos: CycleInfos;
    cycleRunning: boolean;
    currentTurnInfos: Pick<TurnInfos, 'characterId' | 'startTime'> | null;

    onBattleEnd: () => void;
};

export const createBattle = (
    { services }: GlobalEntities,
    battlePayload: BattlePayload,
    onBattleEnd: () => void
): Battle => {
    const battleId = createId('short');

    const { staticPlayers, staticCharacters, staticSpells, staticState, initialSerializableState } = getBattleStaticData(battlePayload);
    const { roomId, staticPlayerList, mapInfos, tiledMap } = battlePayload;

    const playerIdList = new Set(staticPlayerList.map(player => player.playerId));

    const waitingPlayerList = new Set(staticPlayerList
        .filter(player => player.type === 'player')
        .map(player => player.playerId));

    const turnsOrder = staticCharacters.map(character => character.characterId);

    const stateStack: SerializableState[] = [ initialSerializableState ];

    const disconnectedPlayers: DisconnectedPlayers = {};
    const leavedPlayers = new Set<PlayerId>();

    const partialBattle: PartialCycleBattle = {
        battleId,
        playerIdList,
        stateStack,
        cycleInfos: { turnsOrder },
        currentTurnInfos: null,
        cycleRunning: false
    };

    const cycleEngine = services.cycleBattleService.createCycleEngine(partialBattle);

    const partialBattleOthers: Omit<Battle, keyof PartialCycleBattle> = {
        roomId,

        staticPlayers,
        staticCharacters,
        staticSpells,

        mapInfos,
        tiledMap,
        staticState,

        waitingPlayerList,
        disconnectedPlayers,
        leavedPlayers,

        cycleEngine,

        onBattleEnd,
    };

    return Object.assign(partialBattle, partialBattleOthers);
};
