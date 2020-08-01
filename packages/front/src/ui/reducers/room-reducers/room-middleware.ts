import { assertIsDefined, assertIsNonNullable, MapConfig } from '@timeflies/shared';
import { Action, Middleware, MiddlewareAPI } from 'redux';
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
}) => (api: MiddlewareAPI) => next => {

    return async (action: Action) => {

        const ret = next(action);

        const { step } = api.getState();

        if (ReceiveMessageAction.match(action)) {
            const message = action.payload;

            if (message.type === 'battle-run/launch' && step === 'room') {
                const { teamSnapshotList, playerSnapshotList, battleSnapshot, globalTurnState } = message;

                const { room, auth } = api.getState();
                assertIsNonNullable(room);

                const { map: { mapSelected, mapList } } = room;
                assertIsNonNullable(mapSelected);

                const mapConfig = mapList.find(m => m.id === mapSelected.id);
                assertIsDefined(mapConfig);

                const { schema, images } = assetLoader.get('map')!;

                await api.dispatch(BattleStartAction({
                    myPlayerId: auth.id,
                    tiledMapAssets: {
                        schema,
                        imagesUrls: images
                    },
                    teamSnapshotList,
                    playerSnapshotList,
                    entitiesSnapshot: battleSnapshot,
                    globalTurnSnapshot: globalTurnState
                }));

            } else if (message.type === 'room/map/select' || message.type === 'room/state') {

                const getMapConfig = (): MapConfig | undefined => {

                    if (message.type === 'room/map/select') {

                        const { room } = api.getState();
                        assertIsNonNullable(room);

                        const { map: { mapList } } = room;

                        return mapList.find(c => c.id === message.mapSelected?.id);
                    }

                    return message.mapSelected?.config;
                };

                const mapConfig = getMapConfig();

                if (message.mapSelected && mapConfig) {

                    await api.dispatch(SendMessageAction({
                        type: 'room/player/state',
                        isReady: false,
                        isLoading: true
                    }));

                    const { map } = await assetLoader.newInstance()
                        .add('map', mapConfig.schemaUrl)
                        .load();

                    await api.dispatch<MapLoadedAction>({
                        type: 'room/map/loaded',
                        payload: {
                            assets: map
                        }
                    });

                    await assetLoader.newInstance()
                        .addSpritesheet('characters', AssetManager.spritesheets.characters)
                        .addSpritesheet('spells', AssetManager.spritesheets.spells)
                        .load();

                    await api.dispatch(SendMessageAction({
                        type: 'room/player/state',
                        isReady: false,
                        isLoading: false
                    }));
                }

            }
        }

        return ret;
    };
};
