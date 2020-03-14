import { BStateResetEvent, BStateTurnStartEvent } from "../battleState/BattleStateSchema";
import { SpellType } from "@timeflies/shared";
import { SpellPrepareMove } from "./spellEngine/move/SpellPrepareMove";

export interface SpellPrepareEngine {

}

const spellPrepareMap: Partial<Record<SpellType, any>> = {
    'move': SpellPrepareMove
};

type Param = {
    payload: {
        characterId: string;
        spellId: string;
    };
};

export const SpellPrepareEngine = ({ payload: { characterId, spellId } }: Param): SpellPrepareEngine => {

    const { characters } = serviceBattleData('characters');

    const character = characters.find(...);

    const spell = ...;

    const engine = spellPrepareMap[spell.type](spell);

    const onTileHover = engine.onTileHover;

    // dispatch action to bind onTileHover

    return {};
};
