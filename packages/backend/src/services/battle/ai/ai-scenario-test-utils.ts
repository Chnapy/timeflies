import { normalize, SerializableState } from '@timeflies/common';
import { computeChecksum } from '@timeflies/spell-effects';
import type { TiledMap } from 'tiled-types';
import { createFakeGlobalEntitiesNoService } from '../../service-test-utils';
import { createServices } from '../../services';
import { Battle } from '../battle';
import { createFakeBattle } from '../battle-service-test-utils';
import { AIBattleService } from './ai-battle-service';

type BattleProps = {
    staticSpells: Battle[ 'staticSpells' ];
    stateInfos: Pick<SerializableState, 'characters' | 'spells'>;
    initialStateInfos?: Pick<SerializableState, 'characters' | 'spells'>;
    extraCharacters?: Battle[ 'staticCharacters' ];
    tiledMap?: Partial<TiledMap>;
};

export const getAITestEntities = ({ staticSpells, stateInfos, initialStateInfos = stateInfos, extraCharacters = [], tiledMap }: BattleProps) => {

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
                playerId: 'ai1',
                playerName: 'ai-1',
                teamColor: '#00FF00',
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
                characterId: 'c4',
                playerId: 'ai1',
                characterRole: 'tacka',
                defaultSpellId: 's2'
            },
            ...extraCharacters
        ],
        staticSpells
    };

    const firstStates = [
        initialStateInfos,
        stateInfos
    ].map(infos => {
        const state: SerializableState = {
            checksum: '',
            time: 0,
            ...infos
        };
        state.checksum = computeChecksum(state);
        return state;
    });

    const battle: Battle = {
        ...createFakeBattle(),
        ...staticEntities,
        staticState: {
            players: normalize(staticEntities.staticPlayers, 'playerId'),
            characters: normalize(staticEntities.staticCharacters, 'characterId'),
            spells: normalize(staticEntities.staticSpells, 'spellId')
        },
        stateStack: [ ...firstStates ],
        tiledMap: {
            width: 21,
            height: 21,
            layers: [ {
                name: 'obstacles',
                data: []
            } ],
            ...tiledMap
        } as any,
        currentTurnInfos: {
            characterId: 'c4',
            startTime: 1
        }
    };

    const globalEntities = createFakeGlobalEntitiesNoService(undefined, battle);
    const service = new AIBattleService(globalEntities);
    service.services = createServices(globalEntities);
    service.services.aiBattleService = service;

    return { firstStates, battle, globalEntities, service };
};
