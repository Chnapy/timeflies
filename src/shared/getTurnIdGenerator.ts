
// TODO use ES6 generator
export interface TurnIDGenerator {
    (): number;
    nbTurns: number;
    increment(): void;
}

export function getTurnIdGenerator(): TurnIDGenerator {
    let nbTurns = 0;

    const fn = (): number => nbTurns++;

    return Object.assign(fn, {
        get nbTurns(): number {
            return nbTurns;
        },
        increment: () => { nbTurns++; }
    });
}
