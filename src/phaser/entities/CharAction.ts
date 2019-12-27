import { Position } from './Character';
import { Sort } from './Sort';

export type CharAction =
    | {
        type: 'move';
        path: Position[];
    }
    | {
        type: 'sort';
        sortId: number;
        position: Position;
    };
