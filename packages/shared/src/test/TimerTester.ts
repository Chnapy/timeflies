
const oldNowFn = Date.now;

/**
 * Mock Date.now by changing its return value when jest timer functions are used.
 * Simulate time change.
 */
export class TimerTester {

    private spyInstance?: jest.SpyInstance;

    private _now?: number;

    get now(): number {
        if (!this._now) this._now = oldNowFn();
        return this._now;
    }

    beforeTest(): void {
        jest.useFakeTimers();
        this.spyInstance = jest.spyOn(Date, 'now').mockImplementation(() => this.now);
    }

    advanceBy(msToRun: number): Promise<void> {
        this._now = this.now + msToRun;
        jest.advanceTimersByTime(msToRun);
        
        // trigger ended promises
        return Promise.resolve().then(() => {});
    }

    immediates = {
        runAll: () => jest.runAllImmediates()
    } as const;

    afterTest(): void {
        jest.clearAllTimers();
        jest.useRealTimers();
        this.spyInstance?.mockRestore();
        delete this.spyInstance;
        delete this._now;
    }
}
