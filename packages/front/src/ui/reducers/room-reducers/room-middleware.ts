import { assertIsDefined, assertIsNonNullable, MapConfig } from '@timeflies/shared';
import { Action, Middleware } from 'redux';
import { AssetLoader } from '../../../assetManager/AssetLoader';
import { AssetManager } from '../../../assetManager/AssetManager';
import { GameState } from '../../../game-state';
import { ReceiveMessageAction, SendMessageAction } from '../../../socket/wsclient-actions';
import { BattleStartAction } from '../../../stages/battle/battle-actions';
import { MapLoadedAction } from './map-select-reducer/map-select-actions';

type Dependencies = {
    assetLoader: AssetLoader;
};

export const roomMiddleware: (deps: Dependencies) => Middleware<{}, GameState> = ({
    assetLoader
}) => api => next => {

    return (action: Action) => {

        const { step } = api.getState();

        if (ReceiveMessageAction.match(action)) {
            const message = action.payload;

            if (message.type === 'battle-run/launch' && step === 'room') {
                const { battleSnapshot, globalTurnState } = message;

                const { room, currentPlayer } = api.getState();
                assertIsNonNullable(room);

                const { map: { mapSelected, mapList } } = room;
                assertIsNonNullable(mapSelected);

                const mapConfig = mapList.find(m => m.id === mapSelected.id);
                assertIsDefined(mapConfig);

                const { schema, images } = assetLoader.get('map')!;

                next(BattleStartAction({
                    myPlayerId: currentPlayer!.id,
                    tiledMapAssets: {
                        schema,
                        imagesUrls: images
                    },
                    entitiesSnapshot: battleSnapshot,
                    globalTurnSnapshot: globalTurnState
                }));

                return;
            }

            if (message.type === 'room/map/select' || message.type === 'room/state') {

                const getMapConfig = (): MapConfig | undefined => {

                    if (message.type === 'room/map/select') {

                        const { room } = api.getState();
                        assertIsNonNullable(room);

                        const { map: { mapList } } = room;

                        return mapList.find(c => c.id === message.mapSelected?.id);
                    }

                    return message.mapSelected?.config;
                };

                const loadResources = async (mapConfig: MapConfig) => {

                    api.dispatch(SendMessageAction({
                        type: 'room/player/state',
                        isReady: false,
                        isLoading: true
                    }));

                    const { map } = await assetLoader.newInstance()
                        .add('map', mapConfig.schemaUrl)
                        .load();

                    api.dispatch<MapLoadedAction>({
                        type: 'room/map/loaded',
                        payload: {
                            assets: map
                        }
                    });

                    await assetLoader.newInstance()
                        .addSpritesheet('characters', AssetManager.spritesheets.characters)
                        .addSpritesheet('spells', AssetManager.spritesheets.spells)
                        .load();

                    api.dispatch(SendMessageAction({
                        type: 'room/player/state',
                        isReady: false,
                        isLoading: false
                    }));
                };

                const mapConfig = getMapConfig();

                if (message.mapSelected && mapConfig) {

                    loadResources(mapConfig);
                }

            }
        }

        next(action);
    };
};
