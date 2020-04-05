export * from './switchUtil';
export * from './asserts';
export * from './equals';
export * from './getters';
export * from './object';
export * from './asserts';
export * from './getIndexGenerator';
export * from './getOrientationFromTo';

// TODO extract in file
export const inferFn = <T>() => <V extends T>(o: V) => (o);
