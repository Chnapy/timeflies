
export const mergeAfterClean = (target: Record<string, any>, source: object): void => {
    Object.keys(target).forEach(k => delete target[k]);
    Object.assign(target, source);
}