import * as PIXI from 'pixi.js';
import { graphicTheme } from './graphic-theme';


export const GaugeGraphic = (graphic: PIXI.Graphics = new PIXI.Graphics()) => {
    const { palette } = graphicTheme;

    const geoRect = new PIXI.Rectangle();

    const padding = 1;

    let currentPercent = -1;

    const draw = () => {

        const barWidth = (geoRect.width - padding * 2) * currentPercent;

        graphic.clear();

        graphic.beginFill(palette.primary.contrastText);
        graphic.drawRoundedRect(0, 0, geoRect.width, geoRect.height, 2);
        graphic.endFill();

        if (barWidth >= 1) {
            graphic.beginFill(palette.primary.main);
            graphic.drawRoundedRect(1, 1, barWidth, geoRect.height - 2, 2);
            graphic.endFill();
        }
    };

    return {
        graphic,

        setGeo: (rectProps: Partial<Pick<PIXI.Rectangle, 'x' | 'y' | 'width' | 'height'>>): void => {
            Object.assign(geoRect, rectProps);
            graphic.x = geoRect.x;
            graphic.y = geoRect.y;
        },

        /**
         * @param percent 0-1
         */
        update: (percent: number): void => {
            if (percent !== currentPercent) {
                currentPercent = percent;
                draw();
            }
        }
    }
};
