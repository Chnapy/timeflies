import { HasGameObject } from './HasGameObject';

interface CellWrapper {
    cellX: number;
    cellY: number;
    cellWidth: number;
    cellHeight: number;
    cell: HasGameObject;
}

export class Layout implements HasGameObject {

    private debugRects: any[];

    private readonly scene: any;

    private x: number;
    private y: number;
    private width: number;
    private height: number;

    private cellWidth: number;
    private cellHeight: number;

    private readonly nbCellX: number;
    private readonly nbCellY: number;
 
    private readonly cellWrappers: CellWrapper[];

    private readonly graphic: any;

    constructor(scene: any,
        nbCellX: number, nbCellY: number,
        x: number, y: number,
        width: number, height: number) {
        this.scene = scene;
        this.nbCellX = nbCellX;
        this.nbCellY = nbCellY;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.cellWidth = width / nbCellX;
        this.cellHeight = height / nbCellY;
        this.cellWrappers = [];
        this.graphic = scene.add.container(x, y);

        this.scene.game.scale.on('resize', (size: any) => this.onResize(size));
        this.debugRects = [];
        this._debug();
    }

    addCell(cellX: number, cellY: number,
        cellWidth: number, cellHeight: number,
        cell: HasGameObject): void {

        const cellWrapper: CellWrapper = {
            cellX,
            cellY,
            cellWidth,
            cellHeight,
            cell
        };

        this.updateCellBounds(cellWrapper);

        this.cellWrappers.push(cellWrapper);

        this.graphic.add(cellWrapper.cell.getRootGameObject());

        this._debug();
    }

    resize(x: number, y: number, width: number, height: number): void {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.cellWidth = this.width / this.nbCellX;
        this.cellHeight = this.height / this.nbCellY;

        this.cellWrappers.forEach(c => this.updateCellBounds(c));

        this._debug();
    }

    update(time: number, delta: number): void {
        this.cellWrappers.forEach(c => {
            if (c.cell.update) {
                c.cell.update(time, delta)
            }
        });
    }

    getRootGameObject() {
        return this.graphic;
    }

    private onResize(size: any): void {
        this.resize(this.x, this.y, size.width, size.height);
    }

    private updateCellBounds(cell: CellWrapper): void {
        const cellWorldX = cell.cellX * this.cellWidth;
        const cellWorldY = cell.cellY * this.cellHeight;
        const cellWorldWidth = cell.cellWidth * this.cellWidth;
        const cellWorldHeight = cell.cellHeight * this.cellHeight;
        cell.cell.resize(cellWorldX, cellWorldY, cellWorldWidth, cellWorldHeight);
    }

    private _debug(): void {

        this.debugRects.forEach(r => r.destroy());
        this.debugRects.length = 0;

        const rootRect = this.scene.add.rectangle(
            this.x,
            this.y,
            this.width,
            this.height
        )
            .setOrigin(0, 0)
            .setStrokeStyle(2, 0xFF0000);
        this.debugRects.push(rootRect);

        for (let x = 0; x < this.nbCellX; x++) {
            for (let y = 0; y < this.nbCellY; y++) {
                const rect = this.scene.add.rectangle(
                    this.x + x * this.cellWidth,
                    this.x + y * this.cellHeight,
                    this.cellWidth,
                    this.cellHeight
                )
                    .setOrigin(0, 0)
                    .setStrokeStyle(1, 0x000, 0.1);

                this.debugRects.push(rect);
            }
        }
    }
}
