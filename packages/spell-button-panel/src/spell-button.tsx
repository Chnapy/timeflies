import { ButtonBase, makeStyles } from '@material-ui/core';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import { SpellIcon, TimeGauge } from '@timeflies/app-ui';
import { SpellRole } from '@timeflies/common';
import React from 'react';

export type SpellButtonProps = {
    spellRole: SpellRole;
    duration: number;
    imageSize: number;
    selected: boolean;
    disabled: boolean;
};

type StyleProps = Pick<SpellButtonProps, 'selected' | 'disabled'>;

const useStyles = makeStyles(({ palette, transitions }) => ({
    root: ({ disabled }: StyleProps) => ({
        display: 'flex',
        flexDirection: 'column',
        opacity: disabled ? 0.5 : 1,
    }),
    timeGauge: {
        padding: 2,
        backgroundColor: palette.background.default
    },
    button: ({ selected }: StyleProps) => {

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

export const SpellButton: React.FC<SpellButtonProps> = ({
    spellRole, duration, imageSize, selected, disabled
}) => {
    const classes = useStyles({ selected, disabled });

    return (
        <div className={classes.root}>
            <div className={classes.timeGauge}>
                <TimeGauge duration={duration} />
            </div>
            <ButtonBase className={classes.button} disabled={disabled}>
                <SpellIcon size={imageSize} spellRole={spellRole} padding={4} />
            </ButtonBase>
        </div>
    );
};
