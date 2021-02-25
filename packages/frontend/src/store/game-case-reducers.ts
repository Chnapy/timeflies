import { CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import { GameState } from './game-state';

export type GameCaseReducers<K extends keyof GameState> = Record<string, CaseReducer<GameState[ K ], PayloadAction<any, any>>>;
