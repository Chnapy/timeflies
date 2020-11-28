
export const getDiffFromNow = (time: number) => Date.now() - time;

export const waitMs = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
