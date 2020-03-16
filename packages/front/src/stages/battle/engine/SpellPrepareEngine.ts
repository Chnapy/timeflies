import { assertIsDefined, assertThenGet, Position, SpellType } from "@timeflies/shared";
import { serviceBattleData } from '../../../services/serviceBattleData';
import { serviceDispatch } from '../../../services/serviceDispatch';
import { BStateResetEvent, BStateSpellPrepareEvent, BStateTurnStartEvent } from '../battleState/BattleStateSchema';
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
    | BStateSpellPrepareEvent
    | BStateResetEvent
    | BStateTurnStartEvent;

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

    let character: Character, spell: Spell;
    switch (event.type) {
        case 'TURN-START':
        case 'RESET':

            character = assertThenGet(
                characters.find(c => c.id === event.payload.characterId),
                assertIsDefined
            );

            spell = character.defaultSpell;

            break;
        case 'SPELL-PREPARE':

            character = assertThenGet(globalTurn, assertIsDefined).currentTurn.character;

            spell = assertThenGet(
                character.spells.find(s => s.id === event.payload.spellId),
                assertIsDefined
            );

            break;
    }
    return { character, spell };
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
