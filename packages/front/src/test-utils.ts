import { Dispatch, AnyAction } from '@reduxjs/toolkit';
import { waitTimeoutPool } from './wait-timeout-pool';

// Utils for tests
// Do not use them in regular code

/**
 * Dispatch action then
 * - handle Easystar timeout
 * - cancel any current custom timeout (waitTimeout)
 * - avoid any future custom timeout by disabling pool (if disableTimeoutPool defined)
 */
export const getDispatchThenPassTimeouts = (dispatch: Dispatch) => async (action: AnyAction, disableTimeoutPool?: boolean) => {

    const promise = dispatch(action);

    // run easystar timeout
    jest.advanceTimersByTime(100);

    // if wanted, disable future waitTimeout
    disableTimeoutPool && waitTimeoutPool.setPoolEnable(false)

    // cancel all current waitTimeouts 
    await waitTimeoutPool.clearAll();

    return promise;
};
