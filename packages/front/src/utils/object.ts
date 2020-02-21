
export const mergeAfterClean = (target: object, source: object): void => {
    Object.keys(target).forEach(k => delete target[k]);
    Object.assign(target, source);
}