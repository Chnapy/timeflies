import './StoreTest';

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



export { }