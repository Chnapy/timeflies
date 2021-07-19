import { ButtonBase, makeStyles } from '@material-ui/core';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import { SpellIcon, useWithSound } from '@timeflies/app-ui';
import { SpellRole } from '@timeflies/common';
import React from 'react';

export type SpellButtonSimpleProps = {
    spellRole: SpellRole;
    imageSize: number;
    selected: boolean;
    disabled: boolean;
    padding: number;
    onClick?: () => void;
    onMouseEnter?: React.EventHandler<any>;
    onMouseLeave?: () => void;
};

type StyleProps = Pick<SpellButtonSimpleProps, 'selected'> & { clickable: boolean };

const useStyles = makeStyles(({ transitions }) => ({
    root: ({ selected, clickable }: StyleProps) => {

        const commonStyles: CSSProperties = {
            transition: transitions.create([ 'opacity', 'filter' ], {
                duration: transitions.duration.shortest
            }),
        };

        if (selected) {
            return {
                ...commonStyles,
                filter: 'brightness(2)'
            };
        }

        if (!clickable) {
            return {
                cursor: 'default'
            };
        }

        return ({
            ...commonStyles,
            '&:hover': {
                filter: 'brightness(1.5)'
            }
        });
    }
}));

export const SpellButtonSimple: React.FC<SpellButtonSimpleProps> = ({
    spellRole, imageSize, selected, disabled, padding, onClick, onMouseEnter, onMouseLeave
}) => {
    const classes = useStyles({ selected, clickable: !!onClick });
    const withSound = useWithSound('buttonClick');

    return (
        <ButtonBase
            className={classes.root}
            onClick={withSound(onClick)}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onPointerDown={onMouseEnter}
            onPointerUp={onMouseLeave}
            disabled={disabled}
        >
            <SpellIcon size={imageSize} spellRole={spellRole} padding={padding} />
        </ButtonBase>
    );
};
