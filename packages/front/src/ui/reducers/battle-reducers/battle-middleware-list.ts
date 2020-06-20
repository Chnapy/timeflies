import { Middleware } from '@reduxjs/toolkit';
import { GameState } from '../../../game-state';
import { battleActionMiddleware } from '../../../stages/battle/battleState/battle-action-middleware';
import { cycleMiddleware } from '../../../stages/battle/cycle/cycle-middleware';
import { characterIsAlive } from '../../../stages/battle/entities/character/Character';
import { denormalize } from '../../../stages/battle/entities/normalize';
import { snapshotMiddleware } from '../../../stages/battle/snapshot/snapshot-middleware';
import { spellActionMiddleware } from '../../../stages/battle/spellAction/spell-action-middleware';

const extractFutureCharacter = (getState: () => GameState) => {
    const state = getState().battle;
    const { currentCharacterId } = state.cycleState;

    return state.snapshotState.battleDataFuture.characters[ currentCharacterId ];
};

export const getBattleMiddlewareList: () => readonly Middleware[] = () => [
    battleActionMiddleware<GameState>({
        extractState: getState => getState().battle.battleActionState,
        extractFutureAliveCharacterPositionList: getState => denormalize(getState().battle.snapshotState.battleDataFuture.characters)
            .filter(characterIsAlive)
            .map(c => c.position),
        extractFutureCharacter,
        extractFutureSpell: getState => {
            const { snapshotState, battleActionState } = getState().battle;

            const { selectedSpellId } = battleActionState;

            const { spells } = snapshotState.battleDataFuture;

            return selectedSpellId ? spells[ selectedSpellId ] : undefined;
        }
    }),
    cycleMiddleware<GameState>({
        extractState: getState => getState().battle.cycleState,
        extractCurrentCharacters: getState => getState().battle.snapshotState.battleDataCurrent.characters
    }),
    snapshotMiddleware<GameState>({
        extractState: getState => getState().battle.snapshotState
    }),
    spellActionMiddleware<GameState>({
        extractState: getState => getState().battle.snapshotState,
        extractCurrentHash: getState => getState().battle.snapshotState.battleDataCurrent.battleHash,
        extractFutureHash: getState => getState().battle.snapshotState.battleDataFuture.battleHash,
        extractFutureCharacters: getState => getState().battle.snapshotState.battleDataFuture.characters,
        extractFutureSpells: getState => getState().battle.snapshotState.battleDataFuture.spells
    })
];
