import { waitTimeoutPool } from './wait-timeout-pool';

//
// Mock Canvas / Context2D calls
//
window.HTMLCanvasElement.prototype.getContext = (): any => {
    return {
        fillRect: function () { },
        clearRect: function () { },
        getImageData: function (x, y, w, h) {
            return {
                data: new Array(w * h * 4)
            };
        },
        putImageData: function () { },
        createImageData: function () { return [] },
        setTransform: function () { },
        drawImage: function () { },
        save: function () { },
        fillText: function () { },
        restore: function () { },
        beginPath: function () { },
        moveTo: function () { },
        lineTo: function () { },
        closePath: function () { },
        stroke: function () { },
        translate: function () { },
        scale: function () { },
        rotate: function () { },
        arc: function () { },
        fill: function () { },
        measureText: function () {
            return { width: 0 };
        },
        transform: function () { },
        rect: function () { },
        clip: function () { },
    };
};
window.HTMLCanvasElement.prototype.toDataURL = () => {
    return "";
};

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
    jest.useFakeTimers();
    waitTimeoutPool.setPoolEnable(true);
});

afterEach(() => {
    waitTimeoutPool.setPoolEnable(false);
    waitTimeoutPool.clearAll();
    jest.clearAllTimers();
    jest.useRealTimers();
});

export { };
