import React from 'react';
import { Spell } from '../../phaser/entities/Spell';
import { Controller } from '../../Controller';
import { BattleStateMap } from '../../phaser/stateManager/BattleStateManager';
import { BattleStateAction } from '../../phaser/battleReducers/BattleReducerManager';

export interface SpellBtnProps {
    spell: Spell;
    isActive: boolean;
    disabled: boolean;
}

export const SpellBtn: React.FC<SpellBtnProps> = ({ spell, isActive, disabled }) => {
    const {
        name, type, zone, time, attaque
    } = spell;

    return <button
        title={`${name} - Z:${zone} - T:${time} - A:${attaque}`}
        style={isActive
            ? {
                borderStyle: 'inset'
            }
            : undefined}
        disabled={disabled || undefined}
        onClick={() => {

            const stateObject: BattleStateMap = isActive
                ? {
                    state: 'idle'
                }
                : {
                    state: 'spellPrepare',
                    data: {
                        spell
                    }
                };

            Controller.dispatch<BattleStateAction>({
                type: 'battle/state',
                stateObject
            });
        }}
    >
        {name}
    </button>;
};
