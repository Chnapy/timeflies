import { number, object, string } from 'joi';

export type Position = {
    id: string;
    x: number;
    y: number;
};
export const positionSchema = object<Position>({
    id: string().required(),
    x: number().required().integer().min(0),
    y: number().required().integer().min(0)
});

export const getPositionId = (x: number, y: number) => x + ':' + y;

export const createPosition = (x: number, y: number): Position => ({
    id: getPositionId(x, y),
    x,
    y
});
