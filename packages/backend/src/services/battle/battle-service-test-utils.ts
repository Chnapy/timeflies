import { ArrayUtils, createPosition, normalize, SerializableState } from '@timeflies/common';
import { computeChecksum } from '@timeflies/spell-effects';
import type { TiledLayer } from 'tiled-types';
import { Battle } from './battle';

export const createFakeBattle = (): Battle => {

    const staticEntities: Pick<Battle, 'staticPlayers' | 'staticCharacters' | 'staticSpells'> = {
        staticPlayers: [
            {
                playerId: 'p1',
                playerName: 'p-1',
                teamColor: '#FF0000',
                type: 'player'
            },
            {
                playerId: 'p2',
                playerName: 'p-2',
                teamColor: '#00FF00',
                type: 'player'
            },
            {
                playerId: 'p3',
                playerName: 'p-3',
                teamColor: '#FF0000',
                type: 'player'
            },
            {
                playerId: 'ai1',
                playerName: 'ai-1',
                teamColor: '#FF0000',
                type: 'ai'
            }
        ],
        staticCharacters: [
            {
                characterId: 'c1',
                playerId: 'p1',
                characterRole: 'meti',
                defaultSpellId: 's1'
            },
            {
                characterId: 'c2',
                playerId: 'p2',
                characterRole: 'meti',
                defaultSpellId: 's1'
            },
            {
                characterId: 'c3',
                playerId: 'p3',
                characterRole: 'meti',
                defaultSpellId: 's1'
            },
            {
                characterId: 'c4',
                playerId: 'ai1',
                characterRole: 'tacka',
                defaultSpellId: 's2'
            }
        ],
        staticSpells: [
            {
                spellId: 's1',
                characterId: 'c1',
                spellRole: 'simpleAttack'
            },
            {
                spellId: 's2',
                characterId: 'c4',
                spellRole: 'simpleAttack'
            }
        ]
    };

    return {
        battleId: 'battle',
        roomId: 'room',
        playerIdList: new Set([ 'p1', 'p2', 'p3' ]),
        waitingPlayerList: new Set(),
        ...staticEntities,
        staticState: {
            players: normalize(staticEntities.staticPlayers, 'playerId'),
            characters: normalize(staticEntities.staticCharacters, 'characterId'),
            spells: normalize(staticEntities.staticSpells, 'spellId')
        },
        disconnectedPlayers: {},
        leavedPlayers: new Set(),

        mapInfos: {
            mapId: 'm1',
            name: '',
            schemaLink: '',
            imagesLinks: {},
            nbrTeams: 2,
            nbrTeamCharacters: 2
        },
        tiledMap: {
            layers: [ {
                name: 'obstacles',
                data: ArrayUtils.range(50)
            } as TiledLayer ]
        } as any,

        stateStack: [
            (() => {

                const state: SerializableState = {
                    checksum: '',
                    time: 1,
                    characters: {
                        health: { c1: 100, c2: 100, c3: 100, c4: 100 },
                        position: { c1: createPosition(0, 0), c2: createPosition(1, 1), c3: createPosition(2, 2), c4: createPosition(3, 3) },
                        actionTime: { c1: 1000, c2: 1000, c3: 1000, c4: 5000 },
                        orientation: { c1: 'bottom', c2: 'bottom', c3: 'bottom', c4: 'bottom' }
                    },
                    spells: {
                        rangeArea: { s1: 500, s2: 10 },
                        actionArea: { s1: 1, s2: 2 },
                        lineOfSight: { s1: false, s2: false },
                        duration: { s1: 1, s2: 2000 },
                        attack: { s1: 10, s2: 20 }
                    }
                };
                state.checksum = computeChecksum(state);
                return state;
            })()
        ],

        cycleEngine: {
            start: jest.fn(),
            stop: jest.fn(),
            isStarted: jest.fn(() => false),
            disableCharacters: jest.fn(),
            getNextTurnInfos: jest.fn(() => ({ characterId: 'c1', roundIndex: 0, startTime: Date.now(), turnIndex: 0 })),
            setCharacterDuration: jest.fn(),
            setTurnsOrder: jest.fn(),
            startNextTurn: jest.fn(async () => { }),
        },
        cycleRunning: false,
        cycleInfos: { turnsOrder: [ 'c1', 'c2', 'c3', 'c4' ] },
        currentTurnInfos: {
            characterId: 'c1',
            startTime: 1
        },

        onBattleEnd: jest.fn()
    };
};
