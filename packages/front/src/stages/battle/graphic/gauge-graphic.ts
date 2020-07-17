import * as PIXI from 'pixi.js';
import { graphicTheme } from './graphic-theme';

type GeoRect = Pick<PIXI.Rectangle, 'x' | 'y' | 'width' | 'height'>;

export const GaugeGraphic = (graphic: PIXI.Graphics = new PIXI.Graphics()) => {
    const { palette } = graphicTheme;

    const geoRect: GeoRect = new PIXI.Rectangle();

    const padding = 1;

    let currentPercent = -1;

    const draw = () => {
        const borderSize = 1;
        const borderRadius = 0;

        const barWidth = (geoRect.width - padding * borderSize * 2) * currentPercent;

        graphic.clear();

        graphic.beginFill(palette.primary.contrastText);
        graphic.drawRoundedRect(0, 0, geoRect.width, geoRect.height, borderRadius);
        graphic.endFill();

        if (barWidth >= 1) {
            graphic.beginFill(palette.primary.main);
            graphic.drawRoundedRect(borderSize, borderSize, barWidth, geoRect.height - borderSize * 2, borderRadius);
            graphic.endFill();
        }
    };

    return {
        graphic,

        setGeo: (rectProps: Partial<GeoRect>): void => {
            Object.assign(geoRect, rectProps);
            graphic.x = geoRect.x;
            graphic.y = geoRect.y;
            draw();
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
