import { ArrayUtils, createPosition, SerializableState } from '@timeflies/common';
import { computeChecksum } from '@timeflies/spell-effects';
import type { TiledLayer } from 'tiled-types';
import { Battle } from './battle';

export const createFakeBattle = (): Battle => ({
    battleId: 'battle',
    roomId: 'room',
    staticPlayers: [
        { playerId: 'p1' } as any,
        { playerId: 'p2' } as any,
        { playerId: 'p3' } as any
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
        }
    ],
    staticSpells: [],
    staticState: {
        players: {
            p1: {
                playerId: 'p1',
                playerName: 'p-1',
                teamColor: '#FF0000',
                type: 'player'
            },
            p2: {
                playerId: 'p2',
                playerName: 'p-2',
                teamColor: '#00FF00',
                type: 'player'
            },
            p3: {
                playerId: 'p3',
                playerName: 'p-3',
                teamColor: '#0000FF',
                type: 'player'
            }
        },
        characters: {
            c1: {
                characterId: 'c1',
                playerId: 'p1',
                characterRole: 'meti',
                defaultSpellId: 's1'
            },
            c2: {
                characterId: 'c2',
                playerId: 'p2',
                characterRole: 'meti',
                defaultSpellId: 's1'
            },
            c3: {
                characterId: 'c3',
                playerId: 'p3',
                characterRole: 'meti',
                defaultSpellId: 's1'
            }
        },
        spells: {
            s1: {
                spellId: 's1',
                characterId: 'c1',
                spellRole: 'simpleAttack'
            }
        }
    },
    disconnectedPlayers: {},
    tiledMap: {
        layers: [ {
            name: 'obstacles',
            data: ArrayUtils.range(50)
        } as TiledLayer ]
    } as any,
    playerJoin: jest.fn(async () => { }),
    playerDisconnect: jest.fn(),
    getMapInfos: jest.fn(),
    getCycleInfos: jest.fn(),
    getCurrentState: jest.fn(() => {

        const state: SerializableState = {
            checksum: '',
            time: 1,
            characters: {
                health: { c1: 100, c2: 100, c3: 100 },
                position: { c1: createPosition(0, 0) },
                actionTime: { c1: 1000 },
                orientation: { c1: 'bottom' }
            },
            spells: {
                rangeArea: { s1: 500 },
                actionArea: { s1: 1 },
                lineOfSight: { s1: false },
                duration: { s1: 1 },
                attack: { s1: 10 }
            }
        };
        state.checksum = computeChecksum(state);
        return state;
    }),
    getCurrentTurnInfos: jest.fn(() => ({
        characterId: 'c1',
        startTime: 1
    })),
    addNewState: jest.fn()
});
