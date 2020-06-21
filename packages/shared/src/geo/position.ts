
export type Position = {
    id: string;
    x: number;
    y: number;
};

export const getPositionId = (x: number, y: number) => x + ':' + y;

export const createPosition = (x: number, y: number) => ({
    id: getPositionId(x, y),
    x,
    y
});
