import { assertIsDefined, getOrientationFromTo, Orientation, Position, SpellActionSnapshot, switchUtil } from '@timeflies/shared';
import * as PIXI from 'pixi.js';
import { BattleDataPeriod } from '../../../../../BattleData';
import { CanvasContext } from '../../../../../canvas/CanvasContext';
import { serviceEvent } from '../../../../../services/serviceEvent';
import { BStateAction } from '../../../battleState/BattleStateSchema';
import { Character } from '../../../entities/character/Character';
import { SpellActionTimerEndAction, SpellActionTimerStartAction } from '../../../spellAction/SpellActionTimer';
import { TiledMapGraphic } from '../../tiledMap/TiledMapGraphic';
import { CharacterSprite, getAnimPath } from './CharacterSprite';


export interface CharacterGraphic {
    readonly container: PIXI.Container;
}

interface PeriodFn {
    (
        character: Character<BattleDataPeriod>,
        tiledMapGraphic: TiledMapGraphic,
        charactersSheet: PIXI.Spritesheet
    ): PIXI.Sprite;
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

    const periodFn: PeriodFn = character.period === 'current'
        ? periodCurrent
        : periodFuture;

    const sprite = periodFn(
        character,
        tiledMapGraphic,
        charactersSheet
    );
    sprite.interactiveChildren = false;
    sprite.width = tiledMapGraphic.tilewidth;
    sprite.height = tiledMapGraphic.tileheight;
    const worldPos = tiledMapGraphic.getWorldFromTile(character.position);
    sprite.position.set(worldPos.x, worldPos.y);

    container.addChild(sprite);

    return {
        container
    };
};

const periodCurrent: PeriodFn = (character, tiledMapGraphic, spritesheet) => {

    const { onAction } = serviceEvent();

    const { staticData } = character;

    const animatedSprite = new CharacterSprite(spritesheet, {
        characterType: staticData.type,
        characterState: 'idle',
        orientation: character.orientation
    });
    animatedSprite.animationSpeed = 0.4;

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
            animatedSprite.position.set(
                startWorldPos.x + ratio * diffWorldPos.x,
                startWorldPos.y + ratio * diffWorldPos.y,
            );
        });

        return {
            position: endPosition,
            orientation
        };
    };

    const onSimpleAttackAction = ({ startTime, duration, position: endPosition }: SpellActionSnapshot): GeoState => {

        // TODO find a graphic way to show the spell

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
        animatedSprite.position.set(x, y);
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

    return animatedSprite;
};

const periodFuture: PeriodFn = (character, tiledMapGraphic, spritesheet) => {

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
        } else if(action.eventType === 'TURN-END') {

            sprite.visible = false;
        }
    });

    return sprite;
};
