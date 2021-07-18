import { Position, SerializableState, SpellAction, SpellCategory, SpellId, StaticCharacter, StaticSpell } from '@timeflies/common';
import { SpellEffect } from '@timeflies/spell-effects';
import { Battle } from '../battle';
import { AIScenarioUtils } from './ai-scenario-utils';

export type Simulation = {
    spellAction: SpellAction;
    state: SerializableState;
    spellEffect: SpellEffect;
};

export type AIScenarioProps = {
    battle: Battle;
    currentCharacter: StaticCharacter;
    staticSpells: { [ category in SpellCategory ]: StaticSpell[] };
    getInitialState: () => SerializableState;
    getCurrentState: () => SerializableState;
    stateEndTime: number;
    enemyList: StaticCharacter[];
    allyList: StaticCharacter[];

    utils: AIScenarioUtils;
    nbrScenarioUses: number;

    simulateSpellAction: (spellId: SpellId, targetPos: Position, options?: {
        multiplyDurationBy?: number;
    }) => Promise<{
        simulation: Simulation;
        execute: () => void;
    } | null>;
};

export const createAIScenario = (fn: (props: AIScenarioProps) => Promise<boolean>) => fn;
