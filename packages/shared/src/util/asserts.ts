
export function assertIsDefined<V>(v: V, error?: Error): asserts v is Exclude<V, undefined> {
    if (v === undefined) {
        console.assert(false);
        throw error ?? new TypeError('should not be undefined');
    }
};

export function assertIsNonNullable<V>(v: V, error?: Error): asserts v is NonNullable<V> {
    assertIsDefined(v, error);
    if (v === null) {
        console.assert(false);
        throw error ?? new TypeError('should not be null');
    }
};

export const assertThenGet = <V, R extends V>(
    value: V,
    assert: (v: V) => asserts v is R
): R => {
    assert(value);
    return value;
};