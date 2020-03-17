import { assertIsDefined, assertThenGet, Position, SpellType } from "@timeflies/shared";
import { serviceBattleData } from '../../../services/serviceBattleData';
import { serviceDispatch } from '../../../services/serviceDispatch';
import { BStateResetAction, BStateSpellPrepareAction, BStateTurnStartAction, BStateSpellLaunchAction } from '../battleState/BattleStateSchema';
import { Character } from '../entities/Character';
import { Spell } from '../entities/Spell';
import { MapManager } from '../map/MapManager';
import { EngineCreator, SpellEngineBindAction } from './Engine';
import { SpellPrepareMove } from "./spellEngine/move/SpellPrepareMove";

export interface SpellPrepareSubEngine {
    onTileHover(pointerPos: Position): void;
    onTileClick(pointerPos: Position): void;
}

export interface SpellPrepareSubEngineCreator {
    (spell: Spell, mapManager: MapManager): SpellPrepareSubEngine;
}

type Event =
    | BStateSpellPrepareAction
    | BStateSpellLaunchAction
    | BStateResetAction
    | BStateTurnStartAction;

const SpellPrepareMap: Record<SpellType, SpellPrepareSubEngineCreator> = {
    move: SpellPrepareMove,
    orientate: SpellPrepareMove,
    sampleSpell1: SpellPrepareMove,
    sampleSpell2: SpellPrepareMove,
    sampleSpell3: SpellPrepareMove,
};

const extractDataFromEvent = (event: Event): { character: Character; spell: Spell } => {
    const { globalTurn } = serviceBattleData('cycle');
    const { characters } = serviceBattleData('future');

    switch (event.eventType) {
        case 'TURN-START':
        case 'RESET':

            const character1 = assertThenGet(
                characters.find(c => c.id === event.payload.characterId),
                assertIsDefined
            );

            const spell1 = character1.defaultSpell;

            return {
                character: character1,
                spell: spell1
            };
        case 'SPELL-PREPARE':

            const character2 = assertThenGet(globalTurn, assertIsDefined).currentTurn.character;

            const spell2 = assertThenGet(
                character2.spells.find(s => s.staticData.type === event.payload.spellType),
                assertIsDefined
            );

            return {
                character: character2,
                spell: spell2
            };
        case 'SPELL-LAUNCH':

            const character3 = assertThenGet(globalTurn, assertIsDefined).currentTurn.character;

            const spell3 = character3.defaultSpell;

            return {
                character: character3,
                spell: spell3
            };
    }
};

export const SpellPrepareEngine: EngineCreator<Event, [ typeof SpellPrepareMap ]> = (
    {
        event,

        deps: {
            mapManager
        }
    },

    spellPrepareMap = SpellPrepareMap
) => {
    const { character, spell } = extractDataFromEvent(event);

    const engine = spellPrepareMap[ spell.staticData.type ]!(spell, mapManager);

    const { dispatchBind } = serviceDispatch({
        dispatchBind: (): SpellEngineBindAction => ({
            type: 'battle/spell-engine/bind',
            onTileHover: engine.onTileHover,
            onTileClick: engine.onTileClick,
        })
    });

    dispatchBind();

    return {};
};
