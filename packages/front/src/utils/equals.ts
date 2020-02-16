
interface Predicate<T> {
    (v: T): boolean;
}

export const equals = <T>(
    v1: T,
    keys: (keyof T)[] = Object.keys(v1) as any
): Predicate<T> => {

    return v2 => keys.every(k => v1[ k ] === v2[ k ]);
}
