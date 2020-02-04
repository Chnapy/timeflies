
export type ExtractFn<O extends object> = {
    [K in keyof O]: O[K] extends Function ? K : never;
}[keyof O];

export type OmitFn<O extends object, K extends keyof O = never> = Omit<O, ExtractFn<O> | K>;
