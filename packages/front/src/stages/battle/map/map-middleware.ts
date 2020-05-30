import { AnyAction, Middleware } from '@reduxjs/toolkit';
import EasyStar from 'easystarjs';
import { BattleStartAction } from './map-reducer';

export const mapMiddleware: Middleware = api => next => {

    const finder = new EasyStar.js();

    return (action: AnyAction) => {

        // if map grid changed
        // finder.setGrid()

        next(action);
    };
};
