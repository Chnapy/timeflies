import { Styled, BasicStyleProperties } from './Styled';
import { HUDScene } from '../HUDScene';

export abstract class StyledParent<S extends BasicStyleProperties, C extends Styled<any>> extends Styled<S> {

    private _children: C[];
    get children(): readonly C[] {
        return this._children;
    }

    constructor(scene: HUDScene) {
        super(scene);

        this._children = [];
    }

    addChildren(...children: C[]): void {
        this._children.push(...children);
        this.container.add(children.map(c => c.getRootGameObject()));
        this.updateChildren();
    }

    removeChildren(...children: C[]): this {
        this.container.remove(this.children.map(c => c.getRootGameObject()));
        if (children.length === this.children.length) {
            this._children.length = 0;
        } else {
            children.forEach(child => {
                const index = this.children.findIndex(c => c === child);
                this._children.splice(index, 1);
            });
        }
        return this;
    }

    clearChildren(): this {
        return this.removeChildren(...this.children);
    }

    resize(x: number, y: number, width: number, height: number): void {
        super.resize(x, y, width, height);
        this.updateChildren();
    }

    update(time: number, delta: number): void {
        for(const c of this.children) {
            if(c.update) {
                c.update(time, delta);
            }
        }
    }

    protected abstract updateChild(child: C, index: number, size: number): void;

    private updateChildren(): void {
        this.children.forEach((c, i) => this.updateChild(c, i, this.children.length));
    }
}