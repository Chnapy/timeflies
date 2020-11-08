import { Ticker, UPDATE_PRIORITY } from 'pixi.js';

export type TickerManager = ReturnType<typeof createTickerManager>;

export type UpdateFn = (deltaTime: number) => void;

const minInterval = 40;

const getNewTicker = () => {
    const ticker = new Ticker();
    ticker.autoStart = true;
    return ticker;
};

export const createTickerManager = (updateFn: UpdateFn, getTickerInterval: () => number, ticker: Ticker = getNewTicker()) => {

    let isConnectedToTicker = false;
    let deltaMsSum = 0;

    const finalUpdateFn = (deltaTime: number) => {
        let deltaMs = deltaTime / 60 * 1000;

        const tickerInterval = getTickerInterval();

        // if interval too low do not delay update
        if (tickerInterval < minInterval) {
            return updateFn(deltaMs);
        }

        deltaMsSum += deltaMs;

        // delay update according interval
        if (deltaMsSum < tickerInterval) {
            return;
        }

        deltaMs = deltaMsSum;
        deltaMsSum = 0;
        return updateFn(deltaMs);
    };

    return {
        start: () => {
            if (!isConnectedToTicker) {
                ticker.add(finalUpdateFn, undefined, UPDATE_PRIORITY.LOW);
                isConnectedToTicker = true;
            }
        },
        stop: () => {
            if (isConnectedToTicker) {
                ticker.remove(finalUpdateFn);
                isConnectedToTicker = false;
            }
        },
        isRunning: () => isConnectedToTicker,
        resetDeltaMsSum: () => {
            deltaMsSum = 0;
        }
    };
};
