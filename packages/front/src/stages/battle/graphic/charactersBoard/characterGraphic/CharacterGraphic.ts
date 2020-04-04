import { Position, SpellActionSnapshot, switchUtil } from '@timeflies/shared';
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
        character: Character,
        tiledMapGraphic: TiledMapGraphic,
        charactersSheet: PIXI.Spritesheet
    ): PIXI.Sprite;
}

export const CharacterGraphic = (
    period: BattleDataPeriod,
    character: Readonly<Character>
): CharacterGraphic => {

    const { tiledMapGraphic, spritesheets: {
        characters: charactersSheet
    } } = CanvasContext.consumer('tiledMapGraphic', 'spritesheets');

    const container = new PIXI.Container();

    const periodFn: PeriodFn = period === 'current'
        ? periodCurrent
        : periodFuture;

    const sprite = periodFn(
        character,
        tiledMapGraphic,
        charactersSheet
    );
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

    let previousPosition: Position = character.position;

    let ticker: PIXI.Ticker;

    const onMoveAction = ({ startTime, duration, position: endPosition }: SpellActionSnapshot) => {

        animatedSprite
            .setProps({
                characterState: 'walk',
                orientation: character.orientation
            })
            .play();

        const startWorldPos: Position = tiledMapGraphic.getWorldFromTile(previousPosition);
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
    };

    onAction<SpellActionTimerEndAction>('battle/spell-action/end', ({
    }) => {
        ticker.destroy();

        const { x, y } = tiledMapGraphic.getWorldFromTile(previousPosition);
        animatedSprite.position.set(x, y);
        animatedSprite
            .setProps({
                characterState: 'idle',
            })
            .play();
    });

    onAction<SpellActionTimerStartAction>('battle/spell-action/start', ({
        spellActionSnapshot,
        spellActionSnapshot: {
            spellId, position: endPosition
        }
    }) => {
        const spell = character.spells.find(s => s.id === spellId);
        if (!spell) {
            return;
        }

        if (ticker?.started) {
            throw new Error('Spell action received while ticker running');
        }

        ticker = new PIXI.Ticker();

        const actionFn = switchUtil(spell.staticData.type, {
            move: onMoveAction,
            orientate: () => { },
            sampleSpell1: () => { },
            sampleSpell2: () => { },
            sampleSpell3: () => { },
        });
        actionFn(spellActionSnapshot);

        ticker.start();

        previousPosition = endPosition;
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
            });
        }
    });

    return sprite;
};
