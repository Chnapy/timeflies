import { configureStore } from '@reduxjs/toolkit';
import { Meta } from '@storybook/react/types-6-0';
import { SocketContextProvider, SocketHelper } from '@timeflies/socket-client';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { rootReducer } from '../../../store/root-reducer';
import { BattleAssetsLoader } from '../../assets-loader/view/battle-assets-loader';
import { BattleEndContext } from './battle-end-context';
import { BattleEndPanel } from './battle-end-panel';

export default {
    title: 'UI/Battle end panel',
} as Meta;

export const Default: React.FC = () => {
    const [ socketHelper ] = React.useState<SocketHelper>({
        url: '',
        addCloseListener: () => () => { },
        addMessageListener: () => () => { },
        addOpenListener: () => () => { },
        close: () => { },
        getReadyState: () => 1,
        send: () => { }
    });
    const [ store ] = React.useState(() => {
        const preloadedState = rootReducer(undefined, { type: 'foo' });
        preloadedState.credentials = {
            playerId: 'p1',
            playerName: 'chnapy',
            token: '---'
        };
        preloadedState.battle = {
            roomId: 'roomId',
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
            staticCharacters: {
                c1: {
                    characterId: 'c1',
                    characterRole: 'meti',
                    defaultSpellId: '',
                    playerId: 'p1'
                },
                c2: {
                    characterId: 'c2',
                    characterRole: 'tacka',
                    defaultSpellId: '',
                    playerId: 'p1'
                },
                c3: {
                    characterId: 'c3',
                    characterRole: 'tacka',
                    defaultSpellId: '',
                    playerId: 'p2'
                },
                c4: {
                    characterId: 'c4',
                    characterRole: 'vemo',
                    defaultSpellId: '',
                    playerId: 'p3'
                },
                c5: {
                    characterId: 'c5',
                    characterRole: 'meti',
                    defaultSpellId: '',
                    playerId: 'p3'
                }
            },
            playerDisconnectedList: [ 'p3' ],
            characterList: [ 'c1', 'c2', 'c3', 'c4', 'c5' ],
            currentTime: 12,
            serializableStateList: [ 12 ],
            serializableStates: {
                12: {
                    time: 12,
                    checksum: '',
                    characters: {
                        health: { c1: 32, c2: 0, c3: 75, c4: 0, c5: 0 }
                    }
                }
            }
        } as any;

        return configureStore({
            preloadedState,
            reducer: rootReducer
        });
    });

    return (
        <Provider store={store}>
            <SocketContextProvider value={socketHelper}>
                <MemoryRouter initialEntries={[ '/battle/battleId' ]}>
                    <BattleEndContext.Provider value={{
                        winnerTeamColor: '#FFD74A'
                    }}>
                        <BattleAssetsLoader>
                            <BattleEndPanel />
                        </BattleAssetsLoader>
                    </BattleEndContext.Provider>
                </MemoryRouter>
            </SocketContextProvider>
        </Provider>
    );
};
