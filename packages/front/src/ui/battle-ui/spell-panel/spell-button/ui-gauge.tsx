import React from 'react';
import { assertIsNonNullable } from '@timeflies/shared';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';

export type UIGaugeProps = {
    className?: string;
    variant: 'dynamic' | 'static';
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
        backgroundColor: palette.background.default,
        borderRadius: shape.borderRadius,
        overflow: 'hidden'
    },
    content: ({ remainsPercent }: { remainsPercent: number }) => ({
        width: `${remainsPercent}%`,
        height: '100%',
        backgroundColor: 'currentColor',
    })
}))

export const UIGauge: React.FC<UIGaugeProps> = React.memo(({ className, variant, timeElapsed, durationTotal }) => {

    const remainsDuration = Math.max(durationTotal - timeElapsed, 0);

    const remainsPercent = remainsDuration && (remainsDuration / durationTotal * 100);

    const classes = useStyles({ remainsPercent });

    const contentRef = React.useRef<HTMLDivElement>(null);

    const [ animation, setAnimation ] = React.useState<Animation | null>(null);

    React.useEffect(() => {

        animation?.cancel();

        if (variant === 'dynamic') {

            const { current } = contentRef;
            assertIsNonNullable(current);

            try {
                const anim = current.animate([
                    { width: `${remainsPercent}%` },
                    { width: 0 },
                ], {
                    duration: remainsDuration,
                    fill: 'forwards'
                });

                setAnimation(anim);
            } catch (e) {
                console.warn(e);
            }
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ remainsDuration, remainsPercent, variant ]);

    return (
        <div className={clsx(classes.root, className)}>
            <div className={classes.content} ref={contentRef} />
        </div>
    );
});
