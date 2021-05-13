import { CharacterId, createPosition, PlayerId, SerializableState, StaticCharacter, StaticPlayer, StaticSpell } from '@timeflies/common';
import { createCycleEngine } from '@timeflies/cycle-engine';
import { GlobalEntities } from '../../main/global-entities';

export type BattleId = string;

export type MapInfos = {
    mapId: string;
    name: string;
    schemaLink: string;
    imagesLinks: Record<string, string>;
};

export type CycleInfos = {
    turnsOrder: CharacterId[];
};

export type Battle = {
    battleId: BattleId;
    mapInfos: MapInfos;
    staticPlayers: StaticPlayer[];
    staticCharacters: StaticCharacter[];
    staticSpells: StaticSpell[];
    initialSerializableState: SerializableState;
    cycleInfos: CycleInfos;

    playerJoin: (playerId: PlayerId) => void;
};

type RoomInfos = {
    playerIdList: PlayerId[];
};

export const createBattle = ({ services }: GlobalEntities, { playerIdList }: RoomInfos): Battle => {
    const battleId = 'battleId';
    // TODO
    // const battleId = createId();

    const waitingPlayerList = new Set(playerIdList);

    const turnsOrder = [ 'c2', 'c1', 'c3' ];

    const initialSerializableState: SerializableState = {
        checksum: '',
        time: Date.now(),
        characters: {
            actionTime: {
                c1: 10000,
                c2: 12000,
                c3: 9000
            },
            health: {
                c1: 100,
                c2: 110,
                c3: 120
            },
            orientation: {
                c1: 'bottom',
                c2: 'left',
                c3: 'top'
            },
            position: {
                c1: createPosition(8, 3),
                c2: createPosition(10, 3),
                c3: createPosition(9, 11)
            }
        },
        spells: {
            duration: {
                s1: 1000,
                s2: 2000,
                s3: 800,
                s4: 2000,
                s5: 1000,
                s6: 2000,
            },
            rangeArea: {
                s1: 10,
                s2: 6,
                s3: 2,
                s4: 6,
                s5: 1,
                s6: 6,
            },
            actionArea: {
                s1: 1,
                s2: 2,
                s3: 1,
                s4: 2,
                s5: 1,
                s6: 2,
            },
            lineOfSight: {
                s1: true,
                s2: true,
                s3: false,
                s4: true,
                s5: true,
                s6: true,
            },
            attack: {
                s2: 20,
                s4: 20,
                s6: 20,
            }
        }
    };

    const beforeNextTurn = () => services.cycleBattleService.beforeTurnStart(cycleEngine.getNextTurnInfos(), playerIdList);

    const cycleEngine = createCycleEngine({
        charactersList: turnsOrder,
        charactersDurations: initialSerializableState.characters.actionTime,
        listeners: {
            turnEnd: ({ currentTurn }) => {
                console.log('Turn end', currentTurn.turnIndex);
                beforeNextTurn();
                return cycleEngine.startNextTurn();
            }
        }
    });

    const startBattle = () => {
        console.log('! Battle start !')
        cycleEngine.start();

        beforeNextTurn();
    };

    return {
        battleId,

        playerJoin: playerId => {
            waitingPlayerList.delete(playerId);

            if (!cycleEngine.isStarted() && waitingPlayerList.size === 0) {
                return startBattle();
            }
        },

        // TODO remove mock

        mapInfos: {
            mapId: 'azerty',
            name: 'dungeon',
            schemaLink: 'http://localhost:40510/static/maps/map_dungeon.json',
            imagesLinks: {
                "tiles_dungeon_v1.1": 'http://localhost:40510/static/maps/map_dungeon.png'
            }
        },
        staticPlayers: [
            {
                playerId: 'p1',
                playerName: 'chnapy',
                teamColor: '#FF0000'
            },
            {
                playerId: 'p2',
                playerName: 'yoshi2oeuf',
                teamColor: '#00FF00'
            }
        ],
        staticCharacters: [
            {
                characterId: 'c1',
                characterRole: 'tacka',
                playerId: 'p1',
                defaultSpellId: 's1',
            },
            {
                characterId: 'c2',
                characterRole: 'meti',
                playerId: 'p1',
                defaultSpellId: 's3',
            },
            {
                characterId: 'c3',
                characterRole: 'vemo',
                playerId: 'p2',
                defaultSpellId: 's5',
            }
        ],
        staticSpells: [
            {
                characterId: 'c1',
                spellId: 's1',
                spellRole: 'move',
            },
            {
                characterId: 'c1',
                spellId: 's2',
                spellRole: 'simpleAttack',
            },
            {
                characterId: 'c2',
                spellId: 's3',
                spellRole: 'switch',
            },
            {
                characterId: 'c2',
                spellId: 's4',
                spellRole: 'simpleAttack',
            },
            {
                characterId: 'c3',
                spellId: 's5',
                spellRole: 'move',
            },
            {
                characterId: 'c3',
                spellId: 's6',
                spellRole: 'simpleAttack',
            }
        ],
        initialSerializableState,
        cycleInfos: {
            turnsOrder
        }
    };
};
