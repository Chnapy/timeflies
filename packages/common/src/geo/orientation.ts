import { Position } from './position';

export type Orientation = 'left' | 'right' | 'top' | 'bottom';

export const getOrientationFromTo = (
    from: Position,
    to: Position,
): Orientation => {
    const diffX = to.x - from.x;
    const diffY = to.y - from.y;

    if (Math.abs(diffX) > Math.abs(diffY)) {
        return diffX > 0
            ? 'right'
            : 'left';
    } else {
        return diffY > 0
            ? 'bottom'
            : 'top';
    }
};
