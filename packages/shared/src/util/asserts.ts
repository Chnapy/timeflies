
export function assertIsDefined<V>(v: V): asserts v is Exclude<V, undefined> {
    if (v === undefined) {
        throw new TypeError('should not be undefined');
    }
};

export function assertIsNonNullable<V>(v: V): asserts v is NonNullable<V> {
    if (v === undefined) {
        throw new TypeError('should not be undefined nor null');
    }
};

export const assertThenGet = <V, R extends V>(
    value: V,
    assert: (v: V) => asserts v is R
): R => {
    assert(value);
    return value;
};