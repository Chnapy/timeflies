import { Box } from '@material-ui/core';
import { configureStore } from '@reduxjs/toolkit';
import { Meta } from '@storybook/react/types-6-0';
import { createPosition, SerializableState, waitMs } from '@timeflies/common';
import { SocketContextProvider, SocketHelper } from '@timeflies/socket-client';
import { BattlePlayerDisconnectMessage, BattlePlayerDisconnectRemoveMessage } from '@timeflies/socket-messages';
import React from 'react';
import { Provider } from 'react-redux';
import { useAsyncEffect } from 'use-async-effect';
import { rootReducer } from '../../../store/root-reducer';
import { BattleAnnouncementList } from './battle-announcement-list';

export default {
    title: 'UI/Battle announcement list',
} as Meta;

export const Default: React.FC = () => {
    let listeners: any[] = [];
    const [ socketHelper ] = React.useState<SocketHelper>({
        url: '',
        addCloseListener: () => () => { },
        addMessageListener: l => {
            listeners.push(l);
            return () => { };
        },
        addOpenListener: () => () => { },
        close: () => { },
        getReadyState: () => 1,
        send: () => { }
    });

    const getPreloadedState = () => {
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
                actionArea: {},
                rangeArea: {},
                lineOfSight: {},
                attack: {},
                duration: {}
            }
        };

        preloadedState.battle = {
            roomId: '',
            tiledMapInfos: {
                name: '',
                schemaLink: ''
            },
            staticPlayers: {
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
                }
            },
            playerList: [ 'p1', 'p2', 'p3' ],
            staticCharacters: {
                c1: {
                    characterId: 'c1',
                    characterRole: 'meti',
                    defaultSpellId: '',
                    playerId: 'p1'
                },
                c3: {
                    characterId: 'c3',
                    characterRole: 'tacka',
                    defaultSpellId: '',
                    playerId: 'p2'
                }
            },
            staticSpells: {},
            playerDisconnectedList: [],
            characterList: [ 'c1', 'c3', 'c4', 'c5' ],
            currentTime: 12,
            initialSerializableState,
            serializableStateList: [],
            serializableStates: {},
            spellActionEffectList: [],
            spellActionEffects: {},
            playingCharacterId: 'c1',
            roundIndex: 0,
            selectedSpellId: null,
            spellLists: {},
            turnIndex: 0,
            turnStartTime: Date.now() + 4000,
            turnsOrder: [ 'c1', 'c3' ]
        };

        return preloadedState;
    };

    const [ store ] = React.useState(() => {
        const preloadedState = getPreloadedState();

        preloadedState.battle!.playingCharacterId = 'c1';

        return configureStore({
            preloadedState,
            reducer: rootReducer
        });
    });

    useAsyncEffect(async () => {
        await waitMs(2000);

        listeners.forEach(listener => {
            listener([ BattlePlayerDisconnectMessage({ playerId: 'p2' }) ]);
        });

        await waitMs(2000);

        listeners.forEach(listener => {
            listener([ BattlePlayerDisconnectRemoveMessage({ playersToRemove: [ 'p1', 'p2' ], time: Date.now() }) ]);
        });
    }, []);

    return (
        <Provider store={store}>
            <SocketContextProvider value={socketHelper}>
                <Box p={2}>

                    <BattleAnnouncementList />

                </Box>
            </SocketContextProvider>
        </Provider>
    );
};
