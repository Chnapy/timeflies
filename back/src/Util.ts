
const getUnique = (length: number = 9): string => Math.random().toString(36).substr(2, length);

export const Util = {
    getUnique
};
