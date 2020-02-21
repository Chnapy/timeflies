
export type IndexGenerator = Generator<number, never, never>;

export function* getIndexGenerator(): IndexGenerator {
    let i = 0;

    while(true) {
        yield i++;
    }
}
