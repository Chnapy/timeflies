
/**
 * Everything but functions
 */
export type Clonable =
    | undefined
    | null
    | boolean
    | number
    | string
    | Clonable[]
    | { [ k in string | number ]: Clonable }
    | readonly Clonable[]
    | { readonly [ k in string | number ]: Clonable };

type DeepMutable<T> = T extends (infer I)[]
    ? DeepMutable<I>[]
    : (
        T extends {}
        ? { -readonly [ K in keyof T ]: DeepMutable<T[ K ]> }
        : T
    );

const typeofPrimitives: readonly string[] = [ 'undefined', 'boolean', 'number', 'string' ];

export const clone = <V extends Clonable>(value: V): DeepMutable<V> => {

    const type = typeof value;

    if (typeofPrimitives.includes(type) || value === null) {
        return value as any;
    }

    if (Array.isArray(value)) {
        return value.map(v => clone(v as any)) as any;
    }

    if (type === 'object') {
        return Object.entries<Clonable>(value as any).reduce((o, [ k, v ]) => {

            o[ k ] = clone(v as any);

            return o;
        }, {} as any);
    }

    throw new Error(`Type not handled: ${type} for value ${value}`);
};

export const cloneByJSON = <V>(value: V): V => JSON.parse(JSON.stringify(value));
