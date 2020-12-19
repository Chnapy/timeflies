import { makeStyles } from '@material-ui/core';
import { getSpellCategory } from '@timeflies/common';
import { SpellImage, SpellImageProps } from '@timeflies/sprite-image';
import React from 'react';

export type SpellIconProps = Pick<SpellImageProps, 'spellRole' | 'size'> & {
    padding: number;
};

const useStyles = makeStyles(({ palette }) => ({
    root: ({ spellRole, padding }: SpellIconProps) => ({
        display: 'inline-block',
        backgroundColor: palette.spellCategories[ getSpellCategory(spellRole) ],
        padding,
    })
}));

export const SpellIcon: React.FC<SpellIconProps> = props => {
    const classes = useStyles(props);

    const size = props.size - props.padding * 2;

    return (
        <div className={classes.root}>
            <SpellImage {...props} size={size} />
        </div>
    );
};
