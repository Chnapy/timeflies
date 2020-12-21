
export module ObjectTyped {

    export const keys = <O extends {[k: string]: any}>(o: O) => Object.keys(o) as (keyof O)[];

    export const entries = <V, O extends { [ k: string ]: V }>(o: O): [ keyof O, O[ keyof O ] ][] =>
        Object.entries(o) as [ keyof O, O[ keyof O ] ][];
}
