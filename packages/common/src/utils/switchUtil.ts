
export const switchUtil = <
    K extends string | number,
    O extends { [ Key in K ]: unknown }
>(k: K, o: O): O[ K ] => o[ k ];

export const switchUtilOption = <
    K extends string | number,
    O extends { [ Key in K ]?: unknown }
>(k: K, o: O): O[ keyof O ] | undefined => o[ k ];
