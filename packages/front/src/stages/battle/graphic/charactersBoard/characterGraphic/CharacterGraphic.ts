import { assertIsDefined, getOrientationFromTo, Orientation, Position, SpellActionSnapshot, switchUtil } from '@timeflies/shared';
import * as PIXI from 'pixi.js';
import { BattleDataPeriod } from '../../../../../BattleData';
import { CanvasContext } from '../../../../../canvas/CanvasContext';
import { serviceEvent } from '../../../../../services/serviceEvent';
import { BStateAction } from '../../../battleState/BattleStateSchema';
import { Character } from '../../../entities/character/Character';
import { SpellActionTimerEndAction, SpellActionTimerStartAction } from '../../../spellAction/SpellActionTimer';
import { TiledMapGraphic } from '../../tiledMap/TiledMapGraphic';
import { CharacterHud } from './character-hud/character-hud';
import { CharacterSprite, getAnimPath } from './CharacterSprite';


export interface CharacterGraphic {
    readonly character: Readonly<Character<BattleDataPeriod>>;
    readonly container: PIXI.Container;
}

interface PeriodFn<P extends BattleDataPeriod> {
    (
        character: Character<P>,
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

export const CharacterGraphic = (
    character: Readonly<Character<BattleDataPeriod>>
): CharacterGraphic => {

    const { tiledMapGraphic, spritesheets: {
        characters: charactersSheet
    } } = CanvasContext.consumer('tiledMapGraphic', 'spritesheets');

    const container = new PIXI.Container();

    const periodFn: PeriodFn<any> = character.period === 'current'
        ? periodCurrent
        : periodFuture;

    const { sprite, hud } = periodFn(
        character,
        tiledMapGraphic,
        charactersSheet
    );
    sprite.interactiveChildren = false;
    sprite.width = tiledMapGraphic.tilewidth;
    sprite.height = tiledMapGraphic.tileheight;

    container.addChild(sprite);
    const worldPos = tiledMapGraphic.getWorldFromTile(character.position);
    sprite.position.set(worldPos.x, worldPos.y);

    if (hud) {
        container.addChild(hud.container);
        hud.container.position.set(worldPos.x, worldPos.y);
    }

    return {
        character,
        container
    };
};

const periodCurrent: PeriodFn<'current'> = (character, tiledMapGraphic, spritesheet) => {

    const { onAction } = serviceEvent();

    const { staticData } = character;

    const animatedSprite = new CharacterSprite(spritesheet, {
        characterType: staticData.type,
        characterState: 'idle',
        orientation: character.orientation
    });
    animatedSprite.animationSpeed = 0.4;

    const hud = CharacterHud(character);

    const setPosition = (x: number, y: number) => {
        animatedSprite.position.set(x, y);
        hud.container.position.set(x, y);
    };

    let previousState: GeoState = {
        position: character.position,
        orientation: character.orientation
    };

    let ticker: PIXI.Ticker;

    const onMoveAction = ({ startTime, duration, position: endPosition }: SpellActionSnapshot): GeoState => {

        const orientation = getOrientationFromTo(character.position, endPosition);

        animatedSprite
            .setProps({
                characterState: 'walk',
                orientation
            })
            .play();

        const startWorldPos: Position = tiledMapGraphic.getWorldFromTile(previousState.position);
        const endWorldPos: Position = tiledMapGraphic.getWorldFromTile(endPosition);
        const diffWorldPos: Position = {
            x: endWorldPos.x - startWorldPos.x,
            y: endWorldPos.y - startWorldPos.y,
        };

        let now, ratio;
        ticker.add(() => {
            now = Date.now();

            ratio = (now - startTime) / duration;
            const x = startWorldPos.x + ratio * diffWorldPos.x;
            const y = startWorldPos.y + ratio * diffWorldPos.y;

            setPosition(x, y);
        });

        return {
            position: endPosition,
            orientation
        };
    };

    const onSimpleAttackAction = ({ startTime, duration, position: endPosition }: SpellActionSnapshot): GeoState => {
        return previousState;
    };

    onAction<SpellActionTimerEndAction>('battle/spell-action/end', ({
        spellActionSnapshot: { characterId }
    }) => {
        if (characterId !== character.id) {
            return;
        }

        ticker.destroy();

        previousState = {
            position: character.position,
            orientation: character.orientation
        };

        const { x, y } = tiledMapGraphic.getWorldFromTile(previousState.position);

        setPosition(x, y);
        animatedSprite
            .setProps({
                characterState: 'idle',
                orientation: previousState.orientation
            })
            .play();
    });

    onAction<SpellActionTimerStartAction>('battle/spell-action/start', ({
        spellActionSnapshot,
        spellActionSnapshot: {
            characterId, spellId
        }
    }) => {
        if (characterId !== character.id) {
            return;
        }

        const spell = character.spells.find(s => s.id === spellId);
        assertIsDefined(spell);

        if (ticker?.started) {
            throw new Error('Spell action received while ticker running');
        }

        ticker = new PIXI.Ticker();

        const actionFn: (snapshot: SpellActionSnapshot) => GeoState =
            switchUtil(spell.staticData.type, {
                move: onMoveAction,
                orientate: () => ({} as any),
                simpleAttack: onSimpleAttackAction,
                sampleSpell1: () => ({} as any),
                sampleSpell2: () => ({} as any),
                sampleSpell3: () => ({} as any),
            });
        previousState = actionFn(spellActionSnapshot);

        ticker.start();
    });

    return {
        sprite: animatedSprite,
        hud
    };
};

const periodFuture: PeriodFn<'future'> = (character, tiledMapGraphic, spritesheet) => {

    const { onAction } = serviceEvent();

    const idlePath = getAnimPath(character.staticData.type, 'idle', character.orientation);
    const texture: PIXI.Texture = spritesheet.animations[ idlePath ][ 0 ];

    const sprite = new PIXI.Sprite(texture);
    sprite.alpha = 0.25;

    onAction<BStateAction>('battle/state/event', action => {

        if (action.eventType === 'SPELL-LAUNCH') {

            // be sure to run that after spell had touched the character
            setImmediate(() => {
                const idlePath = getAnimPath(character.staticData.type, 'idle', character.orientation);
                const texture: PIXI.Texture = spritesheet.animations[ idlePath ][ 0 ];

                sprite.texture = texture;
                const worldPos = tiledMapGraphic.getWorldFromTile(character.position);
                sprite.position.set(worldPos.x, worldPos.y);
                sprite.visible = true;
            });
        } else if (action.eventType === 'TURN-END') {

            sprite.visible = false;
        }
    });

    return { sprite };
};
