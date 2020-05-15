import { SpellType } from '@timeflies/shared';
import React from 'react';
import { AssetManager } from '../../../../assetManager/AssetManager';
import spriteCss from '../../../../_assets/spritesheets/spells_spritesheet.module.css';
import clsx from 'clsx';
import { Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

export type SpellImageProps = {
    spellType: SpellType;
    size: number;
}

const useStyles = makeStyles(() => ({
    root: ({ size }: { size: number }) => ({
        filter: 'grayscale(1)',
        transformOrigin: '0 0',
        transform: `scale(calc(${size} / 56))`
    })
}));

export const SpellImage: React.FC<SpellImageProps> = React.memo(({ spellType, size }) => {
    const classes = useStyles({ size });

    const typeName = AssetManager.spells.spellsMap[ spellType ];

    return (
        <Box display='inline-block' width={size} height={size} overflow='hidden'>
            {/* TODO find a proper way to load sprite images */}
            <div className={clsx(spriteCss.sprite, spriteCss[ typeName ], classes.root)} style={{
                filter: 'grayscale(1)'
            }} />
        </Box>
    );
});
