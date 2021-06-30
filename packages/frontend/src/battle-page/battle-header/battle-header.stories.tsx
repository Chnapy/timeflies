import { configureStore } from '@reduxjs/toolkit';
import { Meta } from '@storybook/react/types-6-0';
import { createPosition, SerializableState } from '@timeflies/common';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { rootReducer } from '../../store/root-reducer';
import { BattleHeader } from './battle-header';

export default {
    title: 'UI/Battle header',
} as Meta;

export const Default: React.FC = () => {
    const [ store ] = React.useState(() => {
        const preloadedState = rootReducer(undefined, { type: 'foo' });
        preloadedState.credentials = {
            playerId: 'p1',
            playerName: 'chnapy',
            token: '---'
        };

        const initialSerializableState: SerializableState = {
            time: 12,
            checksum: '',
            characters: {
                health: { c1: 32 },
                actionTime: { c1: 90000 },
                orientation: { c1: 'bottom' },
                position: { c1: createPosition(8, 3) },
            },
            spells: {
                actionArea: { s1a: 0, s1b: 0, s1c: 0, s1d: 2 },
                rangeArea: { s1a: 6, s1b: 6, s1c: 6, s1d: 6 },
                lineOfSight: { s1a: true, s1b: true, s1c: true, s1d: true },
                attack: { s1b: 6, s1c: 6, s1d: 6 },
                duration: { s1a: 1000, s1b: 1000, s1c: 1000, s1d: 1000 }
            }
        };

        preloadedState.battle = {
            roomId: 'roomId',
            tiledMapInfos: {
                name: 'dungeon',
                schemaLink: 'fake/maps/map_dungeon.json'
            },
            staticPlayers: {
                p1: {
                    playerId: 'p1',
                    playerName: 'chnapy',
                    teamColor: '#FFD74A',
                    type: 'player'
                }
            },
            playerList: [ 'p1' ],
            staticCharacters: {
                c1: {
                    characterId: 'c1',
                    characterRole: 'tacka',
                    defaultSpellId: 's1a',
                    playerId: 'p1'
                }
            },
            staticSpells: {
                s1a: {
                    characterId: 'c1',
                    spellId: 's1a',
                    spellRole: 'move'
                },
                s1b: {
                    characterId: 'c1',
                    spellId: 's1b',
                    spellRole: 'sword-sting'
                },
                s1c: {
                    characterId: 'c1',
                    spellId: 's1c',
                    spellRole: 'side-attack'
                },
                s1d: {
                    characterId: 'c1',
                    spellId: 's1d',
                    spellRole: 'blood-sharing'
                }
            },
            playerDisconnectedList: [],
            characterList: [ 'c1' ],
            currentTime: 12,
            initialSerializableState,
            serializableStateList: [ 12 ],
            serializableStates: {
                12: initialSerializableState
            },
            spellActionEffectList: [],
            spellActionEffects: {},
            playingCharacterId: 'c1',
            roundIndex: 0,
            selectedSpellId: null,
            spellLists: {
                c1: [ 's1a', 's1b', 's1c', 's1d' ]
            },
            turnIndex: 0,
            turnStartTime: Date.now() + 4000,
            turnsOrder: [ 'c1' ]
        };

        return configureStore({
            preloadedState,
            reducer: rootReducer
        });
    });

    return (
        <Provider store={store}>
            <MemoryRouter initialEntries={[ '/battle/battleId' ]}>

                <BattleHeader />

            </MemoryRouter>
        </Provider>
    );
};
