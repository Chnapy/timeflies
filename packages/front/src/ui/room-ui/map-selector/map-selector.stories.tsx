import React from 'react';
import { StoryProps } from '../../../../.storybook/preview';
import map1Url from '../../../_assets/map/map.json';
import { MapSelector, MyMapConfig } from './map-selector';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { GameState } from '../../../game-state';
import { RootReducer } from '../../reducers/root-reducer';
import { GameAction } from '../../../action/GameAction';

export default {
    title: 'Room/Map Selector',
    component: MapSelector
};

export const Default: React.FC<StoryProps> = () => {

    const mapList: MyMapConfig[] = [
        {
            id: '1',
            name: 'Map 1',
            width: 10,
            height: 8,
            nbrTeams: 2,
            nbrCharactersPerTeam: 3,
            schemaUrl: map1Url,
            defaultTilelayerName: 'decor',
            obstacleTilelayerName: 'obstacles',
            initLayerName: 'init'
        },
        {
            id: '2',
            name: 'Map 2',
            width: 22,
            height: 23,
            nbrTeams: 3,
            nbrCharactersPerTeam: 2,
            schemaUrl: map1Url,
            defaultTilelayerName: 'decor',
            obstacleTilelayerName: 'obstacles',
            initLayerName: 'init'
        },
    ];

    const initialState: GameState = {
        currentPlayer: null,
        step: 'room',
        battle: null,
        load: null,
        room: {
            map: {
                mapList,
                mapListLoading: false,
                mapSelected: null
            }
        }
    };

    const store = createStore<GameState, GameAction, {}, {}>(
        RootReducer,
        initialState
    );

    return (
        <Provider store={store}>
            <MapSelector mapList={mapList} />
        </Provider>
    );
};
