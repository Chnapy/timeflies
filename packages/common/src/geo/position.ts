import * as joi from 'joi';

export type Position = {
    id: string;
    x: number;
    y: number;
};
export const positionSchema = joi.object<Position>({
    id: joi.string().required(),
    x: joi.number().required().integer().min(0),
    y: joi.number().required().integer().min(0)
});

export const getPositionId = (x: number, y: number) => x + ':' + y;

export const createPosition = (x: number, y: number): Position => ({
    id: getPositionId(x, y),
    x,
    y
});
