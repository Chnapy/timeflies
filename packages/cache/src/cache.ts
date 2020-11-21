
const serialize = (obj: any): string => {
    if (Array.isArray(obj)) {
        return JSON.stringify(obj.map(i => serialize(i)))
    } else if (typeof obj === 'object' && obj !== null) {
        return Object.keys(obj)
            .sort()
            .map(k => `${k}:${serialize(obj[ k ])}`)
            .join('|')
    }

    return obj + '';
};

export type Cache<K, V> = {
    set: (key: K, value: V) => void;
    getIfExist: (key: K) => V | undefined;
    getOrElse: (key: K, fn: () => V) => V;
    clear: () => void;
};

export const createCache = <K, V>(): Cache<K, V> => {

    const cache: Record<string, V | undefined> = {};

    const set = (key, value) => {
        const cacheKey = serialize(key);

        cache[ cacheKey ] = value;
    };

    const getIfExist = (key) => {
        const cacheKey = serialize(key);

        return cache[ cacheKey ];
    };

    return {
        set,
        getIfExist,
        getOrElse: (key, fn) => {
            const value = getIfExist(key);
            if (value !== undefined) {
                return value;
            }

            const newValue = fn();
            set(key, newValue);

            return newValue;
        },
        clear: () => {
            Object.keys(cache)
                .forEach(key => {
                    delete cache[ key ];
                });
        }
    };
};
