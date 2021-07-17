import { Position, SerializableState, SpellCategory, SpellId, StaticCharacter, StaticSpell } from '@timeflies/common';
import { Battle } from '../battle';
import { AIScenarioUtils } from './ai-scenario-utils';

export type AIScenarioProps = {
    battle: Battle;
    currentCharacter: StaticCharacter;
    staticSpells: { [ category in SpellCategory ]: StaticSpell[] };
    initialState: SerializableState;
    currentState: SerializableState;
    stateEndTime: number;
    enemyList: StaticCharacter[];
    allyList: StaticCharacter[];

    utils: AIScenarioUtils;
    nbrScenarioUses: number;

    applySpellAction: (spellId: SpellId, targetPos: Position, multiplyDuration?: number) => Promise<boolean>;
};

export const createAIScenario = (fn: (props: AIScenarioProps) => Promise<boolean>) => fn;
