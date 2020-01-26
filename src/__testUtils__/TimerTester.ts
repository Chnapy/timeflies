
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

    advanceBy(msToRun: number): void {
        this._now = this.now + msToRun;
        jest.advanceTimersByTime(msToRun);
    }

    afterTest(): void {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
        this.spyInstance?.mockRestore();
        delete this.spyInstance;
        delete this._now;
    }
}
