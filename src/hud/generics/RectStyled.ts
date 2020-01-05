import { HUDScene } from '../HUDScene';
import { BasicStyleProperties, DefaultStyleEngine, Styled, StyleEngine } from './Styled';
import { StyledParent } from './StyledParent';

export interface RectStyleProperties extends BasicStyleProperties {
    fillColor?: number;
    fillAlpha?: number;
    strokeColor?: number;
    strokeAlpha?: number;
    strokeWidth?: number;
    originX?: number;
    originY?: number;
}

export class RectStyled<C extends Styled<any>> extends StyledParent<RectStyleProperties, C> {

    private readonly rectangle: Phaser.GameObjects.Rectangle;

    constructor(scene: HUDScene) {
        super(scene);

        this.rectangle = scene.add.rectangle(0, 0)
            .setOrigin(0, 0);

        this.container.add(this.rectangle);
    }

    protected updateChild(child: C, index: number, size: number): void {

    }

    protected getDefaultStyle(): RectStyleProperties {
        return {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        };
    }

    protected getStyleEngine(defaultEngine: DefaultStyleEngine): StyleEngine<RectStyleProperties> {

        return {
            ...defaultEngine,
            
            width: v => {
                if(v !== undefined) {
                    this.rectangle.setStrokeStyle(
                        1,
                        0xFFFFFF,
                        this.rectangle.strokeAlpha
                    )
                    this.rectangle.width = v;
                }
            },

            height: v => {
                if(v !== undefined) {
                    this.rectangle.height = v;
                    this.rectangle['geom'].setSize(this.rectangle.width, v);
                    this.rectangle.updateDisplayOrigin()['updateData']();
                }
            },

            originX: v => this.rectangle.originX = v === undefined
                ? this.rectangle.originX
                : v,

            originY: v => this.rectangle.originY = v === undefined
                ? this.rectangle.originY
                : v,

            fillColor: v => this.rectangle.setFillStyle(
                v,
                this.rectangle.fillAlpha
            ),

            fillAlpha: v => this.rectangle.setFillStyle(
                this.rectangle.fillColor,
                v
            ),

            strokeColor: v => this.rectangle.setStrokeStyle(
                this.rectangle.lineWidth,
                v,
                this.rectangle.strokeAlpha
            ),

            strokeAlpha: v => this.rectangle.setStrokeStyle(
                this.rectangle.lineWidth,
                this.rectangle.strokeColor,
                v
            ),

            strokeWidth: v => this.rectangle.setStrokeStyle(
                v,
                this.rectangle.strokeColor,
                this.rectangle.strokeAlpha
            )
        };
    }
}
