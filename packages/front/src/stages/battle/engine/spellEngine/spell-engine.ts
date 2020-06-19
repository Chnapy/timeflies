import { SpellType, Position } from '@timeflies/shared';
import { MiddlewareAPI, AnyAction } from '@reduxjs/toolkit';
import { spellEngineMove } from './move/spell-engine-move';
import { BattleActionState } from '../../battleState/battle-action-reducer';
import { Character } from '../../entities/character/Character';
import { Spell } from '../../entities/spell/Spell';
import { spellEngineSimpleAttack } from './simpleAttack/spell-engine-simpleAttack';

export type SpellEngineDependencies<S> = {
    extractState: (getState: () => S) => BattleActionState;
    extractFutureAliveCharacterPositionList: (getState: () => S) => Position[];
    extractFutureCharacter: (getState: () => S) => Character<'future'> | undefined;
    extractFutureSpell: (getState: () => S) => Spell<'future'> | undefined;
};

export type SpellEngine = (action: AnyAction) => Promise<void>;

export type SpellEngineCreator<D = {}> = <S>(deps: SpellEngineDependencies<S> & D) => (api: MiddlewareAPI) => SpellEngine;

export const spellEngineMap: {
    readonly [ K in SpellType ]: SpellEngineCreator;
} = {
    move: spellEngineMove,
    simpleAttack: spellEngineSimpleAttack
};
