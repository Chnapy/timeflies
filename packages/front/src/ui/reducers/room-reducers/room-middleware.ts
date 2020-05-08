import { Middleware } from 'redux';
import { GameAction } from '../../../action/game-action/GameAction';
import { GameState } from '../../../game-state';
import { StageChangeAction } from '../../../stages/StageManager';
import { assertIsNonNullable, assertIsDefined, MapConfig } from '@timeflies/shared';
import { Controller } from '../../../Controller';
import { MapLoadedAction } from './map-select-reducer/map-select-reducer';
import charactersSpritesheetPath from '../../../_assets/spritesheets/sokoban.json';
import { SendMessageAction } from '../../../socket/WSClient';

export const roomMiddleware: Middleware<{}, GameState> = api => next => {

    return (action: GameAction) => {

        const { step } = api.getState();

        if (action.type === 'message/receive') {
            const { message } = action;

            if (message.type === 'battle-run/launch' && step === 'room') {
                const { battleSnapshot, globalTurnState } = message;

                const { room } = api.getState();
                assertIsNonNullable(room);

                const { map: { mapSelected, mapList } } = room;
                assertIsNonNullable(mapSelected);

                const mapConfig = mapList.find(m => m.id === mapSelected.id);
                assertIsDefined(mapConfig);

                next<StageChangeAction<'battle'>>({
                    type: 'stage/change',
                    stageKey: 'battle',
                    payload: {
                        mapConfig,
                        battleSnapshot,
                        battleData: {
                            cycle: {
                                launchTime: battleSnapshot.launchTime
                            },
                            current: {
                                battleHash: '',
                                teams: [],
                                players: [],
                                characters: []
                            },
                            future: {
                                battleHash: '',
                                teams: [],
                                players: [],
                                characters: [],
                                spellActionSnapshotList: []
                            }
                        },
                        globalTurnState,
                    }
                });
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

                    api.dispatch<SendMessageAction>({
                        type: 'message/send',
                        message: {
                            type: 'room/player/state',
                            isReady: false,
                            isLoading: true
                        }
                    });

                    const { map } = await Controller.loader.newInstance()
                        .add('map', mapConfig.schemaUrl)
                        .load();

                    api.dispatch<MapLoadedAction>({
                        type: 'room/map/loaded',
                        assets: map
                    });

                    await Controller.loader.newInstance()
                        .addSpritesheet('characters', charactersSpritesheetPath)
                        .load();

                    api.dispatch<SendMessageAction>({
                        type: 'message/send',
                        message: {
                            type: 'room/player/state',
                            isReady: false,
                            isLoading: false
                        }
                    });
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
