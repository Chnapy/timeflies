import { ButtonBase, makeStyles } from '@material-ui/core';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import { SpellIcon } from '@timeflies/app-ui';
import { SpellRole } from '@timeflies/common';
import React from 'react';

export type SpellButtonSimpleProps = {
    spellRole: SpellRole;
    imageSize: number;
    selected: boolean;
    disabled: boolean;
    onClick: () => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
};

type StyleProps = Pick<SpellButtonSimpleProps, 'selected'>;

const useStyles = makeStyles(({ transitions }) => ({
    root: ({ selected }: StyleProps) => {

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

        return ({
            ...commonStyles,
            '&:hover': {
                filter: 'brightness(1.5)'
            }
        });
    }
}));

export const SpellButtonSimple: React.FC<SpellButtonSimpleProps> = ({
    spellRole, imageSize, selected, disabled, onClick, onMouseEnter, onMouseLeave
}) => {
    const classes = useStyles({ selected });

    return (
        <ButtonBase
            className={classes.root}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onPointerDown={onMouseEnter}
            onPointerUp={onMouseLeave}
            disabled={disabled}
        >
            <SpellIcon size={imageSize} spellRole={spellRole} padding={4} />
        </ButtonBase>
    );
};
