
export const colorStringToHex = (v: string): number => {
    if (v[ 0 ] !== '#') {
        throw new Error(`color not valid [${v}]: must start with #`);
    }

    const sub = v.substring(1);

    if (sub.length !== 6 && sub.length !== 3) {
        throw new Error(`color not valid [${v}]: incorrect length`);
    }

    const finalStr = sub.length === 6
        ? sub
        : sub + sub;

    return Number.parseInt(finalStr, 16);
};
