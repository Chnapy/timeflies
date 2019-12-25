import React from 'react';
import { Sort } from '../../phaser/entities/Sort';
import { Controller } from '../../Controller';

export interface SortBtnProps {
    sort: Sort;
}

export const SortBtn: React.FC<SortBtnProps> = ({ sort: {
    name, type, zone, time, attaque
} }) => {

    return <button 
    title={`${name} - Z:${zone} - T:${time} - A:${attaque}`}
    onClick={() => {
        // Controller.dispatch()
    }}
    >
        {name}
    </button>;
};
