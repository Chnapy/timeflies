// TODO put this file in @timeflies/common ?
import { timerTester } from './timer-tester';

// In Node v7 unhandled promise rejections will terminate the process
if (!process.env.LISTENING_TO_UNHANDLED_REJECTION) {
    process.on('unhandledRejection', reason => {
        process.env.LISTENING_TO_UNHANDLED_REJECTION = 'true';
        throw reason;
    });
    // Avoid memory leak by adding too many listeners
    process.env.LISTENING_TO_UNHANDLED_REJECTION = 'true';
}

beforeEach(() => {
    timerTester.beforeTest();
});

afterEach(() => {
    timerTester.afterTest();
});
