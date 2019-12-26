import React from 'react';
import { Sort } from '../../phaser/entities/Sort';
import { Controller } from '../../Controller';
import { BattleStateAction } from '../../phaser/scenes/BattleScene';
import { StateMap } from '../../phaser/stateManager/StateManager';

export interface SortBtnProps {
    sort: Sort;
    isActive: boolean;
    disabled: boolean;
}

export const SortBtn: React.FC<SortBtnProps> = ({ sort, isActive, disabled }) => {
    const {
        name, type, zone, time, attaque
    } = sort;

    return <button
        title={`${name} - Z:${zone} - T:${time} - A:${attaque}`}
        style={isActive
            ? {
                borderStyle: 'inset'
            }
            : undefined}
        disabled={disabled || undefined}
        onClick={() => {

            const stateObject: StateMap = isActive
                ? {
                    state: 'idle'
                }
                : {
                    state: 'sortPrepare',
                    data: {
                        sort
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
