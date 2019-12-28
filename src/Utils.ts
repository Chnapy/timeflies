
const keysTyped = Object.keys as <T>(o: T) => (Extract<keyof T, string>)[];

export const Utils = {
    keysTyped
};
