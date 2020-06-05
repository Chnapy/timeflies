import { assertIsDefined, getOrientationFromTo, Orientation, Position, SpellActionSnapshot, switchUtil } from '@timeflies/shared';
import * as PIXI from 'pixi.js';
import { CanvasContext } from '../../../../../canvas/CanvasContext';
import { BattleStateSpellLaunchAction, BattleStateTurnEndAction } from '../../../battleState/battle-state-actions';
import { Character } from '../../../entities/character/Character';
import { BattleDataPeriod } from '../../../snapshot/battle-data';
import { getBattleData } from '../../../snapshot/snapshot-reducer';
import { SpellActionTimerEndAction, SpellActionTimerStartAction } from '../../../spellAction/spell-action-actions';
import { TiledMapGraphic } from '../../tiledMap/TiledMapGraphic';
import { CharacterHud } from './character-hud/character-hud';
import { CharacterSprite, getAnimPath } from './CharacterSprite';
import { StoreEmitter } from '../../../../../store-manager';
import { shallowEqual } from 'react-redux';


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
            if(!tiledSchema) {
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
    };

    // let previousState: GeoState = {
    //     position: character.position,
    //     orientation: character.orientation
    // };

    let ticker: PIXI.Ticker;

    // const onMoveAction = ({ startTime, duration, position: endPosition }: SpellActionSnapshot): GeoState => {

    // const orientation = getOrientationFromTo(character.position, endPosition);

    // animatedSprite
    //     .setProps({
    //         characterState: 'walk',
    //         orientation
    //     })
    //     .play();

    // const startWorldPos: Position = tiledMapGraphic.getWorldFromTile(previousState.position);
    // const endWorldPos: Position = tiledMapGraphic.getWorldFromTile(endPosition);
    // const diffWorldPos: Position = {
    //     x: endWorldPos.x - startWorldPos.x,
    //     y: endWorldPos.y - startWorldPos.y,
    // };

    // let now, ratio;
    // ticker.add(() => {
    //     now = Date.now();

    //     ratio = (now - startTime) / duration;
    //     const x = startWorldPos.x + ratio * diffWorldPos.x;
    //     const y = startWorldPos.y + ratio * diffWorldPos.y;

    //     setPosition(x, y);
    // });

    // return {
    //     position: endPosition,
    //     orientation
    // };
    // };

    // const onSimpleAttackAction = ({ startTime, duration, position: endPosition }: SpellActionSnapshot): GeoState => {
    //     return previousState;
    // };

    // TODO

    // onAction(SpellActionTimerEndAction, ({
    //     spellActionSnapshot: { characterId }
    // }) => {
    //     if (characterId !== character.id) {
    //         return;
    //     }

    //     ticker.destroy();

    //     previousState = {
    //         position: character.position,
    //         orientation: character.orientation
    //     };

    //     const { x, y } = tiledMapGraphic.getWorldFromTile(previousState.position);

    //     setPosition(x, y);
    //     animatedSprite
    //         .setProps({
    //             characterState: 'idle',
    //             orientation: previousState.orientation
    //         })
    //         .play();
    // });

    // onAction(SpellActionTimerStartAction, ({
    //     spellActionSnapshot,
    //     spellActionSnapshot: {
    //         characterId, spellId
    //     }
    // }) => {
    //     if (characterId !== character.id) {
    //         return;
    //     }

    //     const spell = character.spells.find(s => s.id === spellId);
    //     assertIsDefined(spell);

    //     if (ticker?.started) {
    //         throw new Error('Spell action received while ticker running');
    //     }

    //     ticker = new PIXI.Ticker();

    //     const actionFn: (snapshot: SpellActionSnapshot) => GeoState =
    //         switchUtil(spell.staticData.type, {
    //             move: onMoveAction,
    //             orientate: () => ({} as any),
    //             simpleAttack: onSimpleAttackAction,
    //             sampleSpell1: () => ({} as any),
    //             sampleSpell2: () => ({} as any),
    //             sampleSpell3: () => ({} as any),
    //         });
    //     previousState = actionFn(spellActionSnapshot);

    //     ticker.start();
    // });

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
            const { staticData, orientation } = state.battle.snapshotState.battleDataFuture.characters.find(c => c.id === characterId)!;

            return {
                type: staticData.type,
                orientation
            };
        },
        ({ type, orientation }) => {
            const idlePath = getAnimPath(type, 'idle', orientation);
            const texture: PIXI.Texture = spritesheet.animations[ idlePath ][ 0 ];

            sprite.texture = texture;
        },
        shallowEqual
    );

    // TODO

    // onAction(BattleStateSpellLaunchAction, () => {

    //     // be sure to run that after spell had touched the character
    //     setImmediate(() => {
    //         const idlePath = getAnimPath(character.staticData.type, 'idle', character.orientation);
    //         const texture: PIXI.Texture = spritesheet.animations[ idlePath ][ 0 ];

    //         sprite.texture = texture;
    //         const worldPos = tiledMapGraphic.getWorldFromTile(character.position);
    //         sprite.position.set(worldPos.x, worldPos.y);
    //         sprite.visible = true;
    //     });
    // });

    // onAction(BattleStateTurnEndAction, () => {

    //     sprite.visible = false;
    // });

    return { sprite };
};
