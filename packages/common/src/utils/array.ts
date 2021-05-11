
export module ArrayUtils {
    export const last = <I>(arr: I[]): I | undefined => arr[ arr.length - 1 ];

    export const range = (length: number) => {
        const arr: number[] = [];

        for (let i = 0; i < length; i++) {
            arr.push(i);
        }

        return arr;
    };
}
