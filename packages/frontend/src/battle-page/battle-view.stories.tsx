import { configureStore } from '@reduxjs/toolkit';
import { Meta } from '@storybook/react/types-6-0';
import { createPosition, SerializableState, waitMs } from '@timeflies/common';
import { SocketContextProvider, SocketHelper } from '@timeflies/socket-client';
import { ChatSendMessage } from '@timeflies/socket-messages';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { rootReducer } from '../store/root-reducer';
import { BattleAssetsLoader } from './assets-loader/view/battle-assets-loader';
import { BattleView } from './battle-view';

export default {
    title: 'Battle page',
} as Meta;

export const Default: React.FC = () => {
    let listener: any;
    const [ socketHelper ] = React.useState<SocketHelper>({
        url: '',
        addCloseListener: () => () => { },
        addMessageListener: (l) => {
            listener = l;
            return () => { };
        },
        addOpenListener: () => () => { },
        close: () => { },
        getReadyState: () => 1,
        send: async ([ m ]: any) => {
            await waitMs(1000);
            listener([ ChatSendMessage.createResponse(m.requestId, {
                success: true
            }) ]);
        }
    });
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
                health: { c1: 32, c2: 0, c3: 75, c4: 0, c5: 0 },
                actionTime: { c1: 9000, c2: 9000, c3: 9000, c4: 9000, c5: 9000 },
                orientation: { c1: 'bottom', c2: 'bottom', c3: 'bottom', c4: 'bottom', c5: 'bottom' },
                position: { c1: createPosition(8, 3), c2: createPosition(9, 3), c3: createPosition(8, 4), c4: createPosition(8, 2), c5: createPosition(9, 4) },
            },
            spells: {
                actionArea: { s1: 1, s2: 1, s3: 1, s4: 1, s5: 1 },
                rangeArea: { s1: 6, s2: 6, s3: 6, s4: 6, s5: 6 },
                lineOfSight: { s1: true, s2: true, s3: true, s4: true, s5: true },
                attack: {},
                duration: { s1: 1000, s2: 1000, s3: 1000, s4: 1000, s5: 1000 }
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
                    teamColor: '#FFD74A'
                },
                p2: {
                    playerId: 'p2',
                    playerName: 'yoshi2oeuf',
                    teamColor: '#FFD74A'
                },
                p3: {
                    playerId: 'p3',
                    playerName: 'toto',
                    teamColor: '#3BA92A'
                }
            },
            playerList: [ 'p1', 'p2', 'p3' ],
            staticCharacters: {
                c1: {
                    characterId: 'c1',
                    characterRole: 'meti',
                    defaultSpellId: 's1',
                    playerId: 'p1'
                },
                c2: {
                    characterId: 'c2',
                    characterRole: 'tacka',
                    defaultSpellId: 's2',
                    playerId: 'p1'
                },
                c3: {
                    characterId: 'c3',
                    characterRole: 'tacka',
                    defaultSpellId: 's3',
                    playerId: 'p2'
                },
                c4: {
                    characterId: 'c4',
                    characterRole: 'vemo',
                    defaultSpellId: 's4',
                    playerId: 'p3'
                },
                c5: {
                    characterId: 'c5',
                    characterRole: 'meti',
                    defaultSpellId: 's5',
                    playerId: 'p3'
                }
            },
            staticSpells: {
                s1: {
                    characterId: 'c1',
                    spellId: 's1',
                    spellRole: 'move'
                },
                s2: {
                    characterId: 'c2',
                    spellId: 's2',
                    spellRole: 'move'
                },
                s3: {
                    characterId: 'c3',
                    spellId: 's3',
                    spellRole: 'move'
                },
                s4: {
                    characterId: 'c4',
                    spellId: 's4',
                    spellRole: 'move'
                },
                s5: {
                    characterId: 'c5',
                    spellId: 's5',
                    spellRole: 'move'
                },
            },
            playerDisconnectedList: [ 'p3' ],
            characterList: [ 'c1', 'c2', 'c3', 'c4', 'c5' ],
            currentTime: 12,
            initialSerializableState,
            serializableStateList: [ 12 ],
            serializableStates: {
                12: {
                    time: 12,
                    checksum: '',
                    characters: {
                        health: { c1: 32, c2: 0, c3: 75, c4: 0, c5: 0 },
                        actionTime: { c1: 9000, c2: 9000, c3: 9000, c4: 9000, c5: 9000 },
                        orientation: { c1: 'bottom', c2: 'bottom', c3: 'bottom', c4: 'bottom', c5: 'bottom' },
                        position: { c1: createPosition(8, 3), c2: createPosition(9, 3), c3: createPosition(8, 4), c4: createPosition(8, 2), c5: createPosition(9, 4) },
                    },
                    spells: {
                        actionArea: { s1: 1, s2: 1, s3: 1, s4: 1, s5: 1 },
                        rangeArea: { s1: 6, s2: 6, s3: 6, s4: 6, s5: 6 },
                        lineOfSight: { s1: true, s2: true, s3: true, s4: true, s5: true },
                        attack: {},
                        duration: { s1: 1000, s2: 1000, s3: 1000, s4: 1000, s5: 1000 }
                    }
                }
            },
            spellActionEffectList: [],
            spellActionEffects: {},
            playingCharacterId: 'c1',
            roundIndex: 0,
            selectedSpellId: null,
            spellLists: {
                c1: [ 's1', 's2', 's3', 's4' ], c2: [ 's2' ], c3: [ 's3' ], c4: [ 's4' ], c5: [ 's5' ]
            },
            turnIndex: 0,
            turnStartTime: 1,
            turnsOrder: []
        };

        return configureStore({
            preloadedState,
            reducer: rootReducer
        });
    });

    return (
        <Provider store={store}>
            <SocketContextProvider value={socketHelper}>
                <MemoryRouter initialEntries={[ '/battle/battleId' ]}>
                    <BattleAssetsLoader>

                        <BattleView />

                    </BattleAssetsLoader>
                </MemoryRouter>
            </SocketContextProvider>
        </Provider>
    );
};
