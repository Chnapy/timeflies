
interface Predicate<T> {
    (v: T): boolean;
}

export const equals = <T>(
    v1: T,
    _keys?: (keyof T)[]
): Predicate<T> => {

    if (typeof v1 !== 'object') {
        return v2 => v1 === v2;
    }

    if(Array.isArray(v1)) {
        throw new Error('equals() does not handle arrays');
    }

    const keys: (keyof T)[] = _keys ?? Object.keys(v1) as any;

    return v2 => keys.every(k => equals(v1[k])(v2[k]));
}
