
export const assignKeepGetSet: typeof Object.assign = (target: object, ...sources: object[]) => {
    sources.forEach(source => internalAssign(target, source));
    return target;
};

const internalAssign = (target: object, source: object) => {
    Object.keys(source).forEach(key => {
        const descriptor = Object.getOwnPropertyDescriptor(source, key);
        if (descriptor) {
            Object.defineProperty(target, key, descriptor);
        }
    });
};
