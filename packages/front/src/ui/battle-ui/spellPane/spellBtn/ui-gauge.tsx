import React from 'react';
import { assertIsNonNullable } from '@timeflies/shared';
import { makeStyles } from '@material-ui/core/styles';

export type UIGaugeProps = {
    timeElapsed: number;
    durationTotal: number;
    children?: never;
};

const useStyles = makeStyles(({ palette, shape }) => ({
    root: {
        display: 'flex',
        flexGrow: 1,
        height: 4,
        width: '100%',
        backgroundColor: '#E7E7E7',
        borderRadius: shape.borderRadius,
        overflow: 'hidden'
    },
    content: {
        height: '100%',
        backgroundColor: palette.primary.main,
    }
}))

export const UIGauge: React.FC<UIGaugeProps> = React.memo(({ timeElapsed, durationTotal }) => {

    const classes = useStyles();

    const contentRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {

        const { current } = contentRef;
        assertIsNonNullable(current);

        const timeElapsedPercent = timeElapsed / durationTotal * 100;

        current.animate([
            { width: `${100 - timeElapsedPercent}%` },
            { width: 0 },
        ], {
            duration: durationTotal - timeElapsed
        });

    }, [ timeElapsed, durationTotal ]);

    return (
        <div className={classes.root}>
            <div className={classes.content} ref={contentRef} />
        </div>
    );
});
