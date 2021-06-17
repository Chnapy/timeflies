import { ArrayUtils, CharacterId, createId, ObjectTyped, PlayerId, SerializableState, SpellId, StaticCharacter, StaticPlayer, StaticSpell, waitMs } from '@timeflies/common';
import { TurnInfos } from '@timeflies/cycle-engine';
import { logger } from '@timeflies/devtools';
import { MapInfos, RoomEntityListGetMessageData, RoomStaticCharacter, RoomStaticPlayer } from '@timeflies/socket-messages';
import type TiledMap from 'tiled-types';
import { GlobalEntities } from '../../main/global-entities';
import { assetUrl, AssetUrl } from '../../utils/asset-url';
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

    staticPlayers: StaticPlayer[];
    staticCharacters: StaticCharacter[];
    staticSpells: StaticSpell[];

    tiledMap: TiledMap;
    staticState: StaticState;

    disconnectedPlayers: DisconnectedPlayers;

    playerJoin: (playerId: PlayerId) => Promise<void>;
    getMapInfos: (parseUrlMode: keyof AssetUrl) => MapInfos;
    getCycleInfos: () => CycleInfos;
    getCurrentTurnInfos: () => Pick<TurnInfos, 'characterId' | 'startTime'> | null;
    getCurrentState: () => SerializableState;
    addNewState: (state: SerializableState, stateEndTime: number) => Promise<void>;
};

export const createBattle = (
    { services }: GlobalEntities,
    battlePayload: BattlePayload,
    onBattleEnd: () => void
): Battle => {
    const battleId = createId('short');

    const { staticPlayers, staticCharacters, staticSpells, staticState, initialSerializableState } = getBattleStaticData(battlePayload);
    const { roomId, staticPlayerList, mapInfos, tiledMap } = battlePayload;

    const playerIdList = staticPlayerList.map(player => player.playerId);

    const waitingPlayerList = new Set(playerIdList);

    const turnsOrder = staticCharacters.map(character => character.characterId);

    const stateStack: SerializableState[] = [ initialSerializableState ];

    const disconnectedPlayers: DisconnectedPlayers = {};

    const cycleEngine = services.cycleBattleService.createCycleEngineOverlay({
        battleId,
        playerIdList,
        charactersList: turnsOrder,
        charactersDurations: initialSerializableState.characters.actionTime
    });

    const startBattle = async () => {
        // let some time for client to setup listeners
        await waitMs(1000);

        logger.info('Battle [' + battleId + '] start');

        return cycleEngine.start();
    };

    const battleEnd = async (winnerTeamColor: string, stateEndTime: number) => {
        logger.info('Battle [' + battleId + '] ending...');

        await cycleEngine.stop();

        services.endBattleService.onBattleEnd(winnerTeamColor, stateEndTime, playerIdList);
        logger.info('Battle [' + battleId + '] ended.');

        onBattleEnd();
    };

    return {
        battleId,
        roomId,

        staticPlayers,
        staticCharacters,
        staticSpells,

        tiledMap,
        staticState,

        disconnectedPlayers,

        getMapInfos: parseUrlMode => {
            const parseUrl = assetUrl[ parseUrlMode ];

            return {
                ...mapInfos,
                schemaLink: parseUrl(mapInfos.schemaLink),
                imagesLinks: ObjectTyped.entries(mapInfos.imagesLinks)
                    .reduce<MapInfos[ 'imagesLinks' ]>((acc, [ key, value ]) => {
                        acc[ key ] = parseUrl(value);
                        return acc;
                    }, {})
            };
        },

        getCycleInfos: () => ({ turnsOrder }),

        getCurrentTurnInfos: () => cycleEngine.getCurrentTurnInfos(),

        getCurrentState: () => ArrayUtils.last(stateStack)!,

        addNewState: async (state, stateEndTime) => {
            stateStack.push(state);

            // wait current spell action to end
            const timeBeforeEnd = stateEndTime - Date.now();
            await waitMs(timeBeforeEnd);

            cycleEngine.onNewState(state);

            const winnerTeamColor = services.endBattleService.isBattleEnded(state, staticState);
            if (winnerTeamColor) {
                await battleEnd(winnerTeamColor, stateEndTime);
            }
        },

        playerJoin: async playerId => {
            waitingPlayerList.delete(playerId);
            delete disconnectedPlayers[ playerId ];

            if (!cycleEngine.isStarted() && waitingPlayerList.size === 0) {
                await startBattle();
            }
        },
    };
};
