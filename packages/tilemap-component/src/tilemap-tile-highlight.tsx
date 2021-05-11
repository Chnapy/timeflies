import { useTheme } from '@material-ui/core';
import { colorStringToHex } from '@timeflies/common';
import * as PIXI from 'pixi.js';
import React from 'react';
import { CustomPIXIComponent, DisplayObjectProps } from 'react-pixi-fiber';

const TileHighlight = CustomPIXIComponent<PIXI.Graphics, DisplayObjectProps<PIXI.Graphics> & { color: number | null; alpha: number | null; }>({
    customDisplayObject: () => new PIXI.Graphics(),
    customApplyProps: function (this: { applyDisplayObjectProps: (...args: any[]) => void }, graphics, oldProps, newProps) {
        const { color, alpha, x = 0, y = 0, width, height } = newProps;

        graphics.clear();
        if (color) {
            graphics.beginFill(color, alpha);
            graphics.drawRect(x, y, width!, height!);
            graphics.endFill();
        }
    }
}, 'TileHighlight');

export type TilemapTileHighlightProps = {
    isRange?: boolean;
    isAction?: boolean;
    isCurrentAction?: boolean;
    size: number;
};

export const TilemapTileHighlight: React.FC<TilemapTileHighlightProps> = ({
    isRange, isAction, isCurrentAction, size
}) => {
    const tileStatesColors = useTheme().palette.tileStates;
    const rangeColor = colorStringToHex(tileStatesColors.range);
    const actionColor = colorStringToHex(tileStatesColors.action);
    
    const mainColor = isAction || isCurrentAction
        ? actionColor
        : (isRange
            ? rangeColor
            : null);
    const mainAlpha = isAction
        ? 0.75
        : (isRange
            ? 0.5
            : (isCurrentAction
                ? 0.25
                : 0));

    const innerColor = isAction && isRange
        ? rangeColor
        : null;
    const innerAlpha = isAction && isRange
        ? 0.75
        : 0;

    const innerSize = size * 2 / 3;
    const innerPos = (size - innerSize) / 2;

    return (
        <>
            <TileHighlight width={size} height={size} color={mainColor} alpha={mainAlpha} />
            <TileHighlight x={innerPos} y={innerPos} width={innerSize} height={innerSize} color={innerColor} alpha={innerAlpha} />
        </>
    );
};
