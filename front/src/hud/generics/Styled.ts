import { ReducerManager } from '../../ReducerManager';
import { Utils } from '../../Utils';
import { HasGameObject } from '../layout/HasGameObject';

export interface BasicStyleProperties {
    x: number;
    y: number;
    width: number;
    height: number;
}

export type StyleEngine<S extends Record<string, any>> = {
    [K in keyof S]-?: (value?: S[K]) => void;
};

export type DefaultStyleEngine = Readonly<StyleEngine<Pick<BasicStyleProperties, 'x' | 'y'>>>;

export abstract class Styled<S extends BasicStyleProperties> extends ReducerManager<Phaser.Scene> implements HasGameObject {

    private readonly defaultStyleEngine: DefaultStyleEngine = {
        x: v => this.container.setX(v),
        y: v => this.container.setY(v)
    };

    protected readonly container: Phaser.GameObjects.Container;

    private readonly styleEngine: StyleEngine<S>;
    protected _style: Readonly<S>;
    get style(): Readonly<S> {
        return this._style;
    }

    constructor(scene: Phaser.Scene) {
        super(scene);

        this.styleEngine = this.getStyleEngine(this.defaultStyleEngine);

        this._style = this.getDefaultStyle();

        this.container = scene.add.container(0, 0);
    }

    init(): this {
        this.computeStyle(this.style);
        return this;
    }

    update?(time: number, delta: number): void;

    setStyle(style: Partial<S>): this {
        this._style = {
            ...this.style,
            ...style
        };
        this.computeStyle(style);
        return this;
    }

    resize(x: number, y: number, width: number, height: number): void {
        this.setStyle({
            x,
            y,
            width,
            height
        } as S);
    }

    getRootGameObject(): Phaser.GameObjects.Container {
        return this.container;
    }

    private computeStyle(style: Partial<S>): void {
        Utils.entriesTyped(style).forEach((a) => {
            this.styleEngine[a[0]](a[1]);
        });
    }

    protected abstract getDefaultStyle(): S;

    protected abstract getStyleEngine(defaultStyleEngine: DefaultStyleEngine): StyleEngine<S>;
}
