import { TimeFullProps } from './time-props';

export const getTimeSimplifiedDurationFn = (
    { startTime, duration: maxDuration }: TimeFullProps,
    nbrRoundZeros: number
) => {

    const roundNbr = 10 ** nbrRoundZeros;
    const round = (value: number) => Math.ceil(value / roundNbr) * roundNbr;

    return (time: number) => {
        const rawDuration = Math.max(maxDuration - (time - startTime), 0);

        return Math.min(round(rawDuration), maxDuration);
    };
};
