import { configureStore } from '@reduxjs/toolkit';
import { Meta } from '@storybook/react/types-6-0';
import { createPosition, SerializableState, waitMs } from '@timeflies/common';
import { SocketContextProvider, SocketHelper } from '@timeflies/socket-client';
import { ChatSendMessage } from '@timeflies/socket-messages';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { OptionsContextProvider } from '../components/options/options-context';
import { rootReducer } from '../store/root-reducer';
import { BattleAssetsLoader } from './assets-loader/view/battle-assets-loader';
import { BattlePage } from './battle-page';

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
            playerName: 'foo',
            token: '---'
        };

        const initialSerializableState: SerializableState = {
            time: 12,
            checksum: '',
            characters: {
                health: { c1: 32, c2: 90, c3: 75, c4: 50, c5: 50 },
                actionTime: { c1: 90000, c2: 90000, c3: 90000, c4: 9000, c5: 9000 },
                orientation: { c1: 'bottom', c2: 'bottom', c3: 'bottom', c4: 'bottom', c5: 'bottom' },
                position: { c1: createPosition(8, 3), c2: createPosition(9, 3), c3: createPosition(8, 4), c4: createPosition(8, 2), c5: createPosition(9, 4) },
            },
            spells: {
                actionArea: { s1a: 0, s1b: 0, s1c: 0, s1d: 2, s2a: 0, s2b: 0, s2c: 0, s2d: 1, s3a: 0, s3b: 0, s3c: 0, s3d: 1, s4: 1, s5: 1 },
                rangeArea: { s1a: 6, s1b: 6, s1c: 6, s1d: 6, s2a: 2, s2b: 1, s2c: 6, s2d: 6, s3a: 6, s3b: 5, s3c: 2, s3d: 4, s3: 6, s4: 6, s5: 6 },
                lineOfSight: { s1a: true, s1b: true, s1c: true, s1d: true, s2a: false, s2b: true, s2c: false, s2d: false, s3a: true, s3b: true, s3c: true, s3d: true, s3: true, s4: true, s5: true },
                attack: { s1b: 6, s1c: 6, s1d: 6, s2b: 20, s3b: 5, s3c: 5 },
                duration: { s1a: 1000, s1b: 1000, s1c: 1000, s1d: 1000, s2a: 1000, s2b: 5000, s2c: 3000, s2d: 2000, s3a: 700, s3b: 1000, s3c: 5000, s3d: 1000, s3: 1000, s4: 1000, s5: 1000 }
            }
        };

        preloadedState.battle = {
            roomId: 'roomId',
            tiledMapInfos: {
                name: 'dungeon',
                schemaLink: 'fake/maps/map_dungeon.json'
            },
            staticPlayers: {
                p0: {
                    playerId: 'p0',
                    playerName: 'foo',
                    teamColor: null,
                    type: 'spectator'
                },
                p1: {
                    playerId: 'p1',
                    playerName: 'chnapy',
                    teamColor: '#FFD74A',
                    type: 'player'
                },
                p2: {
                    playerId: 'p2',
                    playerName: 'yoshi2oeuf',
                    teamColor: '#FFD74A',
                    type: 'player'
                },
                p3: {
                    playerId: 'p3',
                    playerName: 'toto',
                    teamColor: '#3BA92A',
                    type: 'player'
                }
            },
            playerList: [ 'p1', 'p2', 'p3' ],
            staticCharacters: {
                c1: {
                    characterId: 'c1',
                    characterRole: 'tacka',
                    defaultSpellId: 's1a',
                    playerId: 'p1'
                },
                c2: {
                    characterId: 'c2',
                    characterRole: 'vemo',
                    defaultSpellId: 's2a',
                    playerId: 'p1'
                },
                c3: {
                    characterId: 'c3',
                    characterRole: 'meti',
                    defaultSpellId: 's3a',
                    playerId: 'p1'
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
                },

                s2a: {
                    characterId: 'c2',
                    spellId: 's2a',
                    spellRole: 'switch'
                },
                s2b: {
                    characterId: 'c2',
                    spellId: 's2b',
                    spellRole: 'treacherous-blow'
                },
                s2c: {
                    characterId: 'c2',
                    spellId: 's2c',
                    spellRole: 'attraction'
                },
                s2d: {
                    characterId: 'c2',
                    spellId: 's2d',
                    spellRole: 'distraction'
                },

                s3a: {
                    characterId: 'c3',
                    spellId: 's3a',
                    spellRole: 'move'
                },
                s3b: {
                    characterId: 'c3',
                    spellId: 's3b',
                    spellRole: 'slump'
                },
                s3c: {
                    characterId: 'c3',
                    spellId: 's3c',
                    spellRole: 'last-resort'
                },
                s3d: {
                    characterId: 'c3',
                    spellId: 's3d',
                    spellRole: 'motivation'
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
                12: initialSerializableState
            },
            spellActionEffectList: [ Date.now() - 10, Date.now() + 90000, Date.now() + 90001 ],
            spellActionEffects: {
                [ Date.now() - 10 ]: {
                    spellAction: {
                        checksum: '',
                        duration: 10000,
                        launchTime: Date.now() - 10,
                        spellId: 's1a',
                        targetPos: createPosition(5, 5)
                    },
                    spellEffect: {
                        actionArea: [],
                        duration: 10000,
                        characters: {
                            c1: { health: -30 }
                        }
                    }
                },
                [ Date.now() + 90000 ]: {
                    spellAction: {
                        checksum: '',
                        duration: 10000,
                        launchTime: Date.now() + 90000,
                        spellId: 's1a',
                        targetPos: createPosition(6, 6)
                    },
                    spellEffect: {
                        actionArea: [],
                        duration: 10000,
                        characters: {
                            c1: { health: -30 }
                        }
                    }
                },
                [ Date.now() + 90001 ]: {
                    spellAction: {
                        checksum: '',
                        duration: 10000,
                        launchTime: Date.now() + 90001,
                        spellId: 's1a',
                        targetPos: createPosition(6, 6)
                    },
                    spellEffect: {
                        actionArea: [],
                        duration: 10000,
                        characters: {
                            c1: { health: -30 }
                        }
                    }
                },
            },
            playingCharacterId: 'c1',
            roundIndex: 0,
            selectedSpellId: null,
            spellLists: {
                c1: [ 's1a', 's1b', 's1c', 's1d' ], c2: [ 's2a', 's2b', 's2c', 's2d' ], c3: [ 's3a', 's3b', 's3c', 's3d' ], c4: [ 's4' ], c5: [ 's5' ]
            },
            turnIndex: 0,
            turnStartTime: Date.now() + 4000,
            turnsOrder: [ 'c1', 'c3' ]
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
                    <OptionsContextProvider>
                        <BattleAssetsLoader>

                            <BattlePage />

                        </BattleAssetsLoader>
                    </OptionsContextProvider>
                </MemoryRouter>
            </SocketContextProvider>
        </Provider>
    );
};
