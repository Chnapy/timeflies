
type Point = {
    x: number;
    y: number
};

declare module 'bresenham' {

    export default function (
        x0: number, y0: number,
        x1: number, y1: number
    ): Point[];
    export default function (
        x0: number, y0: number,
        x1: number, y1: number,
        fn: (x: number, y: number) => void
    ): void;
}

declare module 'bresenham/generator' {

    export default function (
        x0: number, y0: number,
        x1: number, y1: number
    ): Generator<Point>;
}
