
export type TurnIDGenerator  = Generator<number, never, never>;

export function* getTurnIdGenerator(): Generator<number, never, never> {
    let nbTurns = 0;

    while(true) {
        yield nbTurns++;
    }
}
