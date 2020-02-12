
export type TurnIDGenerator = Generator<number, never, never>;

export function* getTurnIdGenerator(): TurnIDGenerator {
    let nbTurns = 0;

    while(true) {
        yield nbTurns++;
    }
}
