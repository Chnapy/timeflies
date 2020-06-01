
/**
 * Omit for union types
 */
export type DistributiveOmit<T, K extends keyof any> = T extends any
    ? Omit<T, K>
    : never;

export type ExtractFn<O extends object> = {
    [ K in keyof O ]: O[ K ] extends Function ? K : never;
}[ keyof O ];

export type OmitFn<O extends object, K extends keyof O = never> = Omit<O, ExtractFn<O> | K>;

export type DeepReadonly<T> = T extends Array<infer I>
    ? readonly DeepReadonly<I>[]
    : (T extends Function
        ? T
        : (T extends {}
            ? { readonly [ K in keyof T ]: DeepReadonly<T[ K ]> }
            : T)
    );

export type RequiredOnly<O, K extends keyof O> = Required<Pick<O, K>> & Partial<Omit<O, K>>;
