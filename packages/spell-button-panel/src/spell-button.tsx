import { makeStyles } from '@material-ui/core';
import { TimeGauge } from '@timeflies/time-gauge-panel';
import React from 'react';
import { SpellButtonSimple, SpellButtonSimpleProps } from './spell-button-simple';

export type SpellButtonProps = SpellButtonSimpleProps & {
    duration: number;
};

type StyleProps = Pick<SpellButtonProps, 'disabled'>;

const useStyles = makeStyles(({ palette }) => ({
    root: ({ disabled }: StyleProps) => ({
        display: 'flex',
        flexDirection: 'column',
        opacity: disabled ? 0.5 : 1,
    }),
    timeGauge: {
        padding: 2,
        backgroundColor: palette.background.default
    }
}));

export const SpellButton: React.FC<SpellButtonProps> = ({
    spellRole, duration, imageSize, selected, disabled, onClick, onMouseEnter, onMouseLeave
}) => {
    const classes = useStyles({ disabled });

    return (
        <div className={classes.root}>
            <div className={classes.timeGauge}>
                <TimeGauge duration={duration} />
            </div>

            <SpellButtonSimple
                onClick={onClick}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                disabled={disabled}
                imageSize={imageSize}
                spellRole={spellRole}
                selected={selected}
            />
        </div>
    );
};
