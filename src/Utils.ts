
const keysTyped = Object.keys as <T>(o: T) => (Extract<keyof T, string>)[];

const entriesTyped = Object.entries as <T extends { [ k in string ]: any }>(
    o: T
) => { [ K in Extract<keyof T, string> ]: [ K, T[ K ]] }[ Extract<keyof T, string> ][];

export const Utils = {
    keysTyped,
    entriesTyped
};
