import { Middleware } from '@reduxjs/toolkit';
import { GameState } from '../../../game-state';
import { battleActionMiddleware } from '../../../stages/battle/battleState/battle-action-middleware';
import { cycleMiddleware } from '../../../stages/battle/cycle/cycle-middleware';
import { snapshotMiddleware } from '../../../stages/battle/snapshot/snapshot-middleware';
import { spellActionMiddleware } from '../../../stages/battle/spellAction/spell-action-middleware';

const extractFutureCharacter = (getState: () => GameState) => {
    const state = getState().battle;
    const { currentCharacterId } = state.cycleState;

    return state.snapshotState.battleDataFuture.characters
        .find(c => c.id === currentCharacterId);
};

export const getBattleMiddlewareList: () => readonly Middleware[] = () => [
    battleActionMiddleware<GameState>({
        extractState: getState => getState().battle.battleActionState,
        extractFutureCharacter,
        extractFutureSpell: getState => {
            const character = extractFutureCharacter(getState);

            const state = getState().battle;

            const { currentSpellAction } = state.spellActionState;

            return character?.spells.find(s => s.id === currentSpellAction?.spellId);
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
        extractState: getState => getState().battle.spellActionState,
        extractCurrentHash: getState => getState().battle.snapshotState.battleDataCurrent.battleHash,
        extractFutureHash: getState => getState().battle.snapshotState.battleDataFuture.battleHash,
        extractFutureCharacters: getState => getState().battle.snapshotState.battleDataFuture.characters
    })
];
