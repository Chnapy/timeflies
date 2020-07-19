import { CharacterRole, createPosition, Orientation, Position, SpellActionSnapshot, SpellRole, switchUtilOption } from '@timeflies/shared';
import * as PIXI from 'pixi.js';
import { shallowEqual } from 'react-redux';
import TiledMap from 'tiled-types/types';
import { CanvasContext } from '../../../../../canvas/CanvasContext';
import { StoreEmitter } from '../../../../../store/store-manager';
import { BattleDataPeriod, periodList } from '../../../snapshot/battle-data';
import { getBattleData } from '../../../snapshot/snapshot-reducer';
import { TiledMapGraphic } from '../../tiledMap/TiledMapGraphic';
import { CharacterHud } from './character-hud/character-hud';
import { CharacterSprite, getAnimPath } from './CharacterSprite';

export type CharacterSpriteSizeSetter = typeof setCharacterSpriteSize;

const setCharacterSpriteSize = (role: CharacterRole, sprite: PIXI.Sprite): void => {
    const { texture } = sprite;

    sprite.width = texture.width;
    sprite.height = texture.height;
};

export type CharacterGraphic = ReturnType<typeof CharacterGraphic>;

type SpritePositionSetter = (sprite: PIXI.Sprite) => (tiledSchema: TiledMap, x: number, y: number) => void;

interface PeriodFn {
    (
        characterId: string,
        storeEmitter: StoreEmitter,
        tiledMapGraphic: TiledMapGraphic,
        charactersSheet: PIXI.Spritesheet,
        spritePositionSetter: SpritePositionSetter
    ): {
        sprite: PIXI.Sprite;
        hud?: CharacterHud;
        debug: {
            onStateChange: (payload: any) => void;
        };
    };
}

export const CharacterGraphic = (characterId: string, period: BattleDataPeriod) => {

    const { storeEmitter, tiledMapGraphic, spritesheets: {
        characters: charactersSheet
    } } = CanvasContext.consumer('storeEmitter', 'tiledMapGraphic', 'spritesheets');

    const container = new PIXI.Container();

    const periodFn: PeriodFn = period === 'current'
        ? periodCurrent
        : periodFuture;

    const spritePositionSetter: SpritePositionSetter = sprite => (tiledSchema, x, y) => {
        const tilesize = tiledMapGraphic.getTilesize(tiledSchema).tileheight;

        const marginX = (tilesize - sprite.width) / 2;
        const marginY = Math.min(tilesize - sprite.height, 0) / 2;

        sprite.position.set(
            x + marginX, y + marginY
        );
    };

    const { sprite, hud, debug } = periodFn(
        characterId,
        storeEmitter,
        tiledMapGraphic,
        charactersSheet,
        spritePositionSetter
    );
    sprite.interactiveChildren = false;

    const setSpritePosition = spritePositionSetter(sprite);

    container.addChild(sprite);

    if (hud) {
        container.addChild(hud.container);
    }

    type StateChangePayload = {
        tiledSchema: TiledMap | null;
        position: Position;
    };

    const onStateChange = ({ tiledSchema, position }: StateChangePayload) => {
        if (!tiledSchema) {
            return;
        }

        const worldPos = tiledMapGraphic.getWorldFromTile(tiledSchema, position);
        setSpritePosition(tiledSchema, worldPos.x, worldPos.y);

        if (hud) {
            hud.container.position.set(worldPos.x, worldPos.y);
        }
    }

    storeEmitter.onStateChange(
        (state): StateChangePayload => {
            const { tiledSchema } = state.battle.battleActionState;
            const { position } = getBattleData(state.battle.snapshotState, period).characters[ characterId ];

            return {
                tiledSchema,
                position
            };
        },
        onStateChange,
        shallowEqual
    );


    return {
        container,

        debug: {
            onStateChangePeriod: (payload: StateChangePayloadCurrent | StateChangePayloadFuture) =>
                debug.onStateChange(payload),

            onStateChange
        }
    };
};

type StateChangePayloadCurrent =
    | {
        state: 'no-spell';
        characterPosition: Position;
        tiledSchema: TiledMap | null;
    }
    | {
        state: 'current-spell';
        characterPosition: Position;
        tiledSchema: TiledMap;
        currentSpellAction: SpellActionSnapshot;
        spellRole: SpellRole;
    };

const periodCurrent: PeriodFn = (characterId, storeEmitter, tiledMapGraphic, spritesheet, spritePositionSetter) => {

    const animatedSprite = new CharacterSprite(characterId, 'current', setCharacterSpriteSize);
    animatedSprite.animationSpeed = 0.1;

    const setSpritePosition = spritePositionSetter(animatedSprite);

    const hud = CharacterHud(characterId);

    const setPosition = (tiledSchema: TiledMap, x: number, y: number) => {
        setSpritePosition(tiledSchema, x, y);
        hud.container.position.set(x, y);
    };

    let ticker: PIXI.Ticker | null = null;

    const destroyTicker = () => {
        if (ticker) {
            ticker.destroy();
            ticker = null;
        }
    };

    type SpellFn = (spellActionSnapshot: SpellActionSnapshot, characterPosition: Position, tiledSchema: TiledMap) => void;

    const onMoveAction: SpellFn = ({ startTime, duration, position: endPosition }, characterPosition, tiledSchema) => {

        const startWorldPos: Position = tiledMapGraphic.getWorldFromTile(tiledSchema, characterPosition);
        const endWorldPos: Position = tiledMapGraphic.getWorldFromTile(tiledSchema, endPosition);
        const diffWorldPos = createPosition(
            endWorldPos.x - startWorldPos.x,
            endWorldPos.y - startWorldPos.y,
        );

        const getRatio = () => {
            return Math.min((Date.now() - startTime) / duration, 1);
        };

        const setNewPosition = (ratio: number) => {
            const x = startWorldPos.x + ratio * diffWorldPos.x;
            const y = startWorldPos.y + ratio * diffWorldPos.y;

            setPosition(tiledSchema, x, y);
        };

        const initialRatio = getRatio();

        if (initialRatio === 1) {
            setNewPosition(initialRatio);

        } else {

            ticker?.add(() => {
                const ratio = getRatio();
                setNewPosition(ratio);

                if (ratio === 1) {
                    destroyTicker();
                }
            });
        }
    };

    const onStateChange = (payload: StateChangePayloadCurrent) => {
        if (payload.state === 'no-spell') {
            if (payload.tiledSchema) {
                const p = tiledMapGraphic.getWorldFromTile(payload.tiledSchema, payload.characterPosition);
                setPosition(payload.tiledSchema, p.x, p.y);
            }
            destroyTicker();
            return;
        }
        const { tiledSchema, characterPosition, currentSpellAction, spellRole } = payload;

        if (ticker?.started) {
            destroyTicker();
        }

        const actionFn: SpellFn | undefined = switchUtilOption(spellRole, {
            move: onMoveAction
        });

        if (actionFn) {

            ticker = new PIXI.Ticker();

            actionFn(currentSpellAction, characterPosition, tiledSchema);

            ticker.start();
        }
    };

    storeEmitter.onStateChange(
        ({ battle }): StateChangePayloadCurrent => {
            const { tiledSchema } = battle.battleActionState;
            const { currentSpellAction, battleDataCurrent } = battle.snapshotState;
            const characterPosition = battleDataCurrent.characters[ characterId ].position;
            if (!tiledSchema || currentSpellAction?.characterId !== characterId) {
                return {
                    state: 'no-spell',
                    characterPosition,
                    tiledSchema
                };
            }

            const spellRole = battleDataCurrent.spells[ currentSpellAction.spellId ].staticData.role;

            return {
                state: 'current-spell',
                tiledSchema,
                characterPosition,
                currentSpellAction,
                spellRole
            };
        },
        onStateChange,
        shallowEqual
    );

    return {
        sprite: animatedSprite,
        hud,
        debug: {
            onStateChange
        }
    };
};

type StateChangePayloadFuture =
    | {
        type: CharacterRole;
        orientation: Orientation;
    }
    | null;

const periodFuture: PeriodFn = (characterId, storeEmitter, tiledMapGraphic, spritesheet, spritePositionSetter) => {

    const sprite = new PIXI.Sprite();
    sprite.alpha = 0.25;

    const onStateChange = (payload: StateChangePayloadFuture) => {

        if (payload) {
            const { type, orientation } = payload;
            const idlePath = getAnimPath(type, 'idle', orientation);

            const textureList: PIXI.Texture[] | undefined = spritesheet.animations[ idlePath ];

            if(!textureList) {
                throw new Error('Sprite animation texture not found for path ' + idlePath);
            }

            const texture = textureList[ 0 ];

            sprite.texture = texture;
            setCharacterSpriteSize(type, sprite);

            sprite.visible = true;

        } else {
            sprite.visible = false;
        }
    };

    storeEmitter.onStateChange(
        ({ currentPlayer, battle }) => {
            if (battle.cycleState.currentCharacterId !== characterId) {
                return null;
            }
            const { staticData, orientation, playerId } = battle.snapshotState.battleDataFuture.characters[ characterId ];

            if (playerId !== currentPlayer?.id) {
                return null;
            }

            const [ positionPeriod1, positionPeriod2 ] = periodList.map(period => getBattleData(battle.snapshotState, period).characters[ characterId ].position);

            if (positionPeriod1.id === positionPeriod2.id) {
                return null;
            }

            return {
                type: staticData.role,
                orientation
            };
        },
        onStateChange,
        shallowEqual
    );

    return {
        sprite,
        debug: {
            onStateChange
        }
    };
};
