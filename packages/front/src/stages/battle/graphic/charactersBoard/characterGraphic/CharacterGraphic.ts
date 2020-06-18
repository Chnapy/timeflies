import { Orientation, Position, SpellActionSnapshot, switchUtil } from '@timeflies/shared';
import * as PIXI from 'pixi.js';
import { shallowEqual } from 'react-redux';
import TiledMap from 'tiled-types/types';
import { CanvasContext } from '../../../../../canvas/CanvasContext';
import { StoreEmitter } from '../../../../../store-manager';
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
    };
}

interface GeoState {
    position: Position;
    orientation: Orientation;
}

export const CharacterGraphic = (characterId: string, period: BattleDataPeriod) => {

    const { storeEmitter, tiledMapGraphic, spritesheets: {
        characters: charactersSheet
    } } = CanvasContext.consumer('storeEmitter', 'tiledMapGraphic', 'spritesheets');

    const container = new PIXI.Container();

    const periodFn: PeriodFn = period === 'current'
        ? periodCurrent
        : periodFuture;

    const { sprite, hud } = periodFn(
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

    storeEmitter.onStateChange(
        state => {
            const { tiledSchema } = state.battle.battleActionState;
            const { position } = getBattleData(state.battle.snapshotState, period).characters.find(c => c.id === characterId)!;

            return {
                tiledSchema,
                position
            };
        },
        ({ tiledSchema, position }) => {
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
        },
        shallowEqual
    );


    return {
        // character,
        container
    };
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

    type SpellFn = (spellActionSnapshot: SpellActionSnapshot, characterPosition: Position, tiledSchema: TiledMap) => void;

    const onMoveAction: SpellFn = ({ startTime, duration, position: endPosition }, characterPosition, tiledSchema) => {

        const startWorldPos: Position = tiledMapGraphic.getWorldFromTile(tiledSchema, characterPosition);
        const endWorldPos: Position = tiledMapGraphic.getWorldFromTile(tiledSchema, endPosition);
        const diffWorldPos: Position = {
            x: endWorldPos.x - startWorldPos.x,
            y: endWorldPos.y - startWorldPos.y,
        };

        let now, ratio;
        ticker?.add(() => {
            now = Date.now();

            ratio = (now - startTime) / duration;
            const x = startWorldPos.x + ratio * diffWorldPos.x;
            const y = startWorldPos.y + ratio * diffWorldPos.y;

            setPosition(x, y);
        });
    };

    storeEmitter.onStateChange(
        ({ battle }) => {
            const { tiledSchema } = battle.battleActionState;
            const { currentSpellAction, battleDataCurrent } = battle.snapshotState;
            const characterPosition = battleDataCurrent.characters.find(c => c.id === characterId)!.position;
            if (!tiledSchema || currentSpellAction?.characterId !== characterId) {
                return {
                    state: 'no-spell' as const,
                    characterPosition,
                    tiledSchema
                };
            }

            const spellType = battleDataCurrent.spells.find(s => s.id === currentSpellAction.spellId)!.staticData.type;

            return {
                state: 'current-spell' as const,
                tiledSchema,
                characterPosition,
                currentSpellAction,
                spellType
            };
        },
        payload => {
            if (payload.state === 'no-spell') {
                if (payload.tiledSchema) {
                    const p = tiledMapGraphic.getWorldFromTile(payload.tiledSchema, payload.characterPosition);
                    setPosition(p.x, p.y);
                }
                ticker?.destroy();
                ticker = null;
                return;
            }
            const { tiledSchema, characterPosition, currentSpellAction, spellType } = payload;

            if (ticker?.started) {
                ticker?.destroy();
                ticker = null;
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
        },
        shallowEqual
    );

    return {
        sprite: animatedSprite,
        hud
    };
};

const periodFuture: PeriodFn = (characterId, storeEmitter, tiledMapGraphic, spritesheet) => {

    const sprite = new PIXI.Sprite();
    sprite.alpha = 0.25;

    storeEmitter.onStateChange(
        state => {
            if (state.battle.cycleState.currentCharacterId !== characterId) {
                return null;
            }
            const { staticData, orientation } = state.battle.snapshotState.battleDataFuture.characters.find(c => c.id === characterId)!;

            return {
                type: staticData.type,
                orientation
            };
        },
        payload => {
            if (!payload) {
                sprite.visible = false;
                return;
            }
            const { type, orientation } = payload;
            const idlePath = getAnimPath(type, 'idle', orientation);
            const texture: PIXI.Texture = spritesheet.animations[ idlePath ][ 0 ];

            sprite.texture = texture;
            sprite.visible = true;
        },
        shallowEqual
    );

    return { sprite };
};
