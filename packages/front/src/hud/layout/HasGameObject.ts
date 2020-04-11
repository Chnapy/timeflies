
export interface HasGameObject extends Resizable {

    update?(time: number, delta: number): void;

    getRootGameObject(): any;
}

export interface Resizable {

    resize(x: number, y: number, width: number, height: number): void;
}
