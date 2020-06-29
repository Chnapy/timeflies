import { Position, SpellActionSnapshot, switchUtil, createPosition, SpellType, CharacterType, Orientation } from '@timeflies/shared';
import * as PIXI from 'pixi.js';
import { shallowEqual } from 'react-redux';
import TiledMap from 'tiled-types/types';
import { CanvasContext } from '../../../../../canvas/CanvasContext';
import { StoreEmitter } from '../../../../../store/store-manager';
import { BattleDataPeriod } from '../../../snapshot/battle-data';
import { getBattleData } from '../../../snapshot/snapshot-reducer';
import { TiledMapGraphic } from '../../tiledMap/TiledMapGraphic';
import { CharacterHud } from './character-hud/character-hud';
import { CharacterSprite, getAnimPath } from './CharacterSprite';
import { requestRender } from '../../../../../canvas/GameCanvas';


export type CharacterGraphic = ReturnType<typeof CharacterGraphic>;

interface PeriodFn {
    (
        characterId: string,
        storeEmitter: StoreEmitter,
        tiledMapGraphic: TiledMapGraphic,
        charactersSheet: PIXI.Spritesheet
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

    const { sprite, hud, debug } = periodFn(
        characterId,
        storeEmitter,
        tiledMapGraphic,
        charactersSheet
    );
    sprite.interactiveChildren = false;

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

        const { tilewidth, tileheight } = tiledMapGraphic.getTilesize(tiledSchema);
        sprite.width = tilewidth;
        sprite.height = tileheight;

        const worldPos = tiledMapGraphic.getWorldFromTile(tiledSchema, position);
        sprite.position.set(worldPos.x, worldPos.y);

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
        spellType: SpellType;
    };

const periodCurrent: PeriodFn = (characterId, storeEmitter, tiledMapGraphic) => {

    const animatedSprite = new CharacterSprite(characterId, 'current');
    animatedSprite.animationSpeed = 0.4;

    const hud = CharacterHud(characterId);

    const setPosition = (x: number, y: number) => {
        animatedSprite.position.set(x, y);
        hud.container.position.set(x, y);

        requestRender();
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

            setPosition(x, y);
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
                setPosition(p.x, p.y);
            }
            destroyTicker();
            return;
        }
        const { tiledSchema, characterPosition, currentSpellAction, spellType } = payload;

        if (ticker?.started) {
            destroyTicker();
        }

        ticker = new PIXI.Ticker();

        const actionFn: SpellFn = switchUtil(spellType, {
            move: onMoveAction,
            orientate: () => { },
            simpleAttack: () => { },
            sampleSpell1: () => { },
            sampleSpell2: () => { },
            sampleSpell3: () => { },
        });
        actionFn(currentSpellAction, characterPosition, tiledSchema);

        ticker.start();
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

            const spellType = battleDataCurrent.spells[ currentSpellAction.spellId ].staticData.type;

            return {
                state: 'current-spell',
                tiledSchema,
                characterPosition,
                currentSpellAction,
                spellType
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
        type: CharacterType;
        orientation: Orientation;
    }
    | null;

const periodFuture: PeriodFn = (characterId, storeEmitter, tiledMapGraphic, spritesheet) => {

    const sprite = new PIXI.Sprite();
    sprite.alpha = 0.25;

    const onStateChange = (payload: StateChangePayloadFuture) => {

        if (payload) {
            const { type, orientation } = payload;
            const idlePath = getAnimPath(type, 'idle', orientation);
            const texture: PIXI.Texture = spritesheet.animations[ idlePath ][ 0 ];

            sprite.texture = texture;
            sprite.visible = true;
            
        } else {
            sprite.visible = false;
        }

        requestRender();
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

            return {
                type: staticData.type,
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
