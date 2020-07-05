import { AnyAction, MiddlewareAPI } from '@reduxjs/toolkit';
import { GridTile, Normalized, Position, SpellRole } from '@timeflies/shared';
import { BattleActionState } from '../../battleState/battle-action-reducer';
import { Character } from '../../entities/character/Character';
import { Spell } from '../../entities/spell/Spell';
import { spellEngineMove } from './move/spell-engine-move';
import { spellEngineSimpleAttack } from './simpleAttack/spell-engine-simpleAttack';
import { spellEngineSwitch } from './switch/spell-engine-switch';

export type SpellEngineDependencies<S> = {
    extractState: (getState: () => S) => BattleActionState;
    extractGrid: (getState: () => S) => Normalized<GridTile>;
    extractFutureAliveCharacterPositionList: (getState: () => S) => Position[];
    extractFutureCharacter: (getState: () => S) => Character<'future'> | undefined;
    extractFutureSpell: (getState: () => S) => Spell<'future'> | undefined;
};

export type SpellEngine = (action: AnyAction) => Promise<void>;

export type SpellEngineCreator<D = {}> = <S>(deps: SpellEngineDependencies<S> & D) => (api: MiddlewareAPI) => SpellEngine;

export const spellEngineMap: {
    readonly [ K in SpellRole ]: SpellEngineCreator;
} = {
    move: spellEngineMove,
    simpleAttack: spellEngineSimpleAttack,
    switch: spellEngineSwitch
};
