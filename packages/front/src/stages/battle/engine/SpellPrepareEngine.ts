import { assertIsDefined, assertThenGet, Position, TileType } from "@timeflies/shared";
import { serviceBattleData } from '../../../services/serviceBattleData';
import { serviceDispatch } from '../../../services/serviceDispatch';
import { BattleStateAction, BattleStateResetAction, BattleStateSpellLaunchAction, BattleStateSpellPrepareAction, BattleStateTurnEndAction, BattleStateTurnStartAction } from '../battleState/battle-state-actions';
import { Character } from '../entities/character/Character';
import { Spell } from '../entities/spell/Spell';
import { MapManager } from '../map/MapManager';
import { EngineCreator } from './Engine';
import { SpellEngineBindAction } from './engine-actions';
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

type Event = Exclude<BattleStateAction, BattleStateTurnEndAction>;

type ExtractFromEvent = { character: Character<'future'>; spell: Spell<'future'> };

const extractDataFromEvent = (event: Event): ExtractFromEvent => {
    const { globalTurn } = serviceBattleData('cycle');
    const { characters } = serviceBattleData('future');

    const onTurnStartOrReset = ({ payload }: BattleStateTurnStartAction | BattleStateResetAction) => {

        const character = assertThenGet(
            characters.find(c => c.id === payload.characterId),
            assertIsDefined
        );

        const spell = character.defaultSpell;

        return {
            character,
            spell
        };
    };

    const extractMap = {
        [ BattleStateResetAction.type ]: onTurnStartOrReset,
        [ BattleStateTurnStartAction.type ]: onTurnStartOrReset,
        [ BattleStateSpellPrepareAction.type ]: ({ payload }: BattleStateSpellPrepareAction) => {
            const currentChar = assertThenGet(globalTurn, assertIsDefined).currentTurn.character;
            const character = assertThenGet(
                characters.find(c => c.id === currentChar.id),
                assertIsDefined
            );

            const spell = assertThenGet(
                character.spells.find(s => s.staticData.type === payload.spellType),
                assertIsDefined
            );

            return {
                character,
                spell
            };
        },
        [ BattleStateSpellLaunchAction.type ]: () => {

            const currentChar = assertThenGet(globalTurn, assertIsDefined).currentTurn.character;
            const character = assertThenGet(
                characters.find(c => c.id === currentChar.id),
                assertIsDefined
            );

            const spell = character.defaultSpell;

            return {
                character,
                spell
            };
        }
    } as const;

    return extractMap[ event.type ](event as any);
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

    const engine = getSubEngine(spell.staticData.type)(spell, mapManager);

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
        dispatchBind: (spell: Spell<'future'>, rangeArea: Position[]) => SpellEngineBindAction({
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
