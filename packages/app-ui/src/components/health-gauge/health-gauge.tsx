import { makeStyles } from '@material-ui/core';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import { ArrayUtils, switchUtil } from '@timeflies/common';
import clsx from 'clsx';
import React from 'react';

export type HealthGaugeProps = {
    direction: 'horizontal' | 'vertical';
    health: number;
};

const tickMaxSize = 6;

const healthPerTick = 25;

const useStyles = makeStyles(({ palette }) => ({
    root: ({ direction }: Pick<HealthGaugeProps, 'direction'>) => ({
        display: 'flex',
        flexWrap: 'nowrap',
        flexGrow: 1,
        ...switchUtil(direction, {
            horizontal: {
                height: 4
            },
            vertical: {
                flexDirection: 'column-reverse',
                height: '100%',
                width: 4
            } as CSSProperties
        })
    }),
    tick: ({ direction }: Pick<HealthGaugeProps, 'direction'>) => ({
        flexGrow: 1,
        backgroundColor: palette.variables.health,
        ...switchUtil(direction, {
            horizontal: {
                height: '100%',
                maxWidth: tickMaxSize,
                minWidth: 1,
            },
            vertical: {
                width: '100%',
                maxHeight: tickMaxSize,
                minHeight: 1,
            }
        })
    }),
    tickSpace: ({ direction }: Pick<HealthGaugeProps, 'direction'>) => switchUtil(direction, {
        horizontal: { marginLeft: 2 },
        vertical: { marginBottom: 2 }
    })
}));

export const HealthGauge: React.FC<HealthGaugeProps> = ({ health, direction }) => {
    const classes = useStyles({ direction });

    const nbrTicks = Math.ceil(health / healthPerTick);

    const lastTickSize = health % healthPerTick > 0
        ? Math.max((health % healthPerTick) / healthPerTick * tickMaxSize, 1)
        : undefined;

    return <div className={classes.root}>
        {ArrayUtils.range(nbrTicks)
            .map(i => (
                <div
                    key={i}
                    className={clsx(classes.tick, {
                        [ classes.tickSpace ]: i !== 0
                    })}
                    style={switchUtil(direction, {
                        horizontal: {
                            maxWidth: i === nbrTicks - 1 ? lastTickSize : undefined
                        },
                        vertical: {
                            maxHeight: i === nbrTicks - 1 ? lastTickSize : undefined
                        }
                    })}
                />
            ))}
    </div>;
};
