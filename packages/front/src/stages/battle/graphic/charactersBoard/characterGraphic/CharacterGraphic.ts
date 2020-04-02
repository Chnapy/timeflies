import { Position, SpellActionSnapshot, switchUtil } from '@timeflies/shared';
import * as PIXI from 'pixi.js';
import { BattleDataPeriod } from '../../../../../BattleData';
import { CanvasContext } from '../../../../../canvas/CanvasContext';
import { serviceEvent } from '../../../../../services/serviceEvent';
import { Character } from '../../../entities/character/Character';
import { SpellActionTimerStartAction, SpellActionTimerEndAction } from '../../../spellAction/SpellActionTimer';
import { CharacterSprite } from './CharacterSprite';


export interface CharacterGraphic {
    readonly container: PIXI.Container;
}

export const CharacterGraphic = (
    period: Extract<BattleDataPeriod, 'current'>,
    character: Readonly<Character>,
    spritesheet: PIXI.Spritesheet
): CharacterGraphic => {

    const { onAction } = serviceEvent();

    const { tiledMapGraphic } = CanvasContext.consumer('tiledMapGraphic');

    const { staticData } = character;
    const worldPos = tiledMapGraphic.getWorldFromTile(character.position);

    const container = new PIXI.Container();

    const animatedSprite = new CharacterSprite(spritesheet, {
        characterType: staticData.type,
        characterState: 'idle',
        orientation: character.orientation
    });
    animatedSprite.animationSpeed = 0.4;
    animatedSprite.position.set(worldPos.x, worldPos.y);

    container.addChild(animatedSprite);

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
        if(!spell) {
            return;
        }

        if(ticker?.started) {
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

    return {
        container
    };
};
