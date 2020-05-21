import { assertIsDefined, assertThenGet, Position, TileType } from "@timeflies/shared";
import { serviceBattleData } from '../../../services/serviceBattleData';
import { serviceDispatch } from '../../../services/serviceDispatch';
import { BStateResetAction, BStateSpellLaunchAction, BStateSpellPrepareAction, BStateTurnStartAction } from '../battleState/BattleStateSchema';
import { Character } from '../entities/character/Character';
import { Spell } from '../entities/spell/Spell';
import { MapManager } from '../map/MapManager';
import { EngineCreator, SpellEngineBindAction } from './Engine';
import { getSpellPrepareSubEngine } from './spellMapping';

export interface SpellPrepareSubEngine<HR> {
    getRangeArea(): Position[];
    onTileHover(tilePos: Position, tileType: TileType): Promise<HR>;
    onTileClick(tilePos: Position, tileType: TileType): Promise<boolean>;
    stop(): void;
}

export interface SpellPrepareSubEngineCreator<HR> {
    (spell: Spell<'future'>, mapManager: MapManager): SpellPrepareSubEngine<HR>;
}

type Event =
    | BStateSpellPrepareAction
    | BStateSpellLaunchAction
    | BStateResetAction
    | BStateTurnStartAction;

const extractDataFromEvent = (event: Event): { character: Character<'future'>; spell: Spell<'future'> } => {
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

            const currentChar1 = assertThenGet(globalTurn, assertIsDefined).currentTurn.character;
            const character2 = assertThenGet(
                characters.find(c => c.id === currentChar1.id),
                assertIsDefined
            );

            const spell2 = assertThenGet(
                character2.spells.find(s => s.staticData.type === event.payload.spellType),
                assertIsDefined
            );

            return {
                character: character2,
                spell: spell2
            };
        case 'SPELL-LAUNCH':

            const currentChar2 = assertThenGet(globalTurn, assertIsDefined).currentTurn.character;
            const character3 = assertThenGet(
                characters.find(c => c.id === currentChar2.id),
                assertIsDefined
            );

            const spell3 = character3.defaultSpell;

            return {
                character: character3,
                spell: spell3
            };
    }
};

export const SpellPrepareEngine: EngineCreator<Event, [ typeof getSpellPrepareSubEngine ]> = (
    {
        event,
        deps: {
            mapManager
        }
    },
    getSubEngine: typeof getSpellPrepareSubEngine = getSpellPrepareSubEngine
) => {
    const { spell } = extractDataFromEvent(event);

    const { globalTurn } = serviceBattleData('cycle');

    assertIsDefined(globalTurn);

    const engine = getSubEngine( spell.staticData.type )(spell, mapManager);

    const ifCanSpellBeUsed = <F extends SpellPrepareSubEngine<any>>(
        fct: F[ 'onTileHover' ]
    ) => async (tilePos: Position) => {
        const remainingTime = globalTurn.currentTurn.getRemainingTime('future');
        if (remainingTime >= spell.feature.duration) {

            const tileType = mapManager.tiledManager.getTileType(tilePos);

            return await fct(tilePos, tileType);
        } 
    };

    const { dispatchBind } = serviceDispatch({
        dispatchBind: (spell: Spell<'future'>, rangeArea: Position[]): SpellEngineBindAction => ({
            type: 'battle/spell-engine/bind',
            spell,
            rangeArea,
            onTileHover: ifCanSpellBeUsed(engine.onTileHover),
            onTileClick: ifCanSpellBeUsed(engine.onTileClick),
        })
    });

    const rangeArea = engine.getRangeArea();

    dispatchBind(spell, rangeArea);

    return {
        stop() {
            engine.stop();
        }
    };
};
