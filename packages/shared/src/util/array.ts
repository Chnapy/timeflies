
/**
 * Remove first array item found by given fn.
 * 
 * @returns the removed item if any
 */
export const removeFromArray = <I>(array: I[], fn: (item: I, index: number) => boolean): I | undefined => {
    const index = array.findIndex(fn);
    return array.splice(index, 1)[0];
};
