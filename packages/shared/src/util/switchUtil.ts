
export const switchUtil = <
    K extends string | number,
    O extends { [Key in K]: unknown }
>(k: K, o: O): O[K] => o[k];