import { Box, withStyles } from '@material-ui/core';
import React from 'react';
import { useBattleFeedbackContext } from './battle-feedback-context';
import { FeedbackEffectsInfos, FeedbackEffectsStack } from './feedback-effects/feedback-effects-stack';
import { FeedbackTurn, FeedbackTurnProps } from './feedback-turn';

type BattleFeedbackProps = {
    previewEffects?: FeedbackEffectsInfos;
    futureEffects?: FeedbackEffectsInfos[];
    currentEffects?: FeedbackEffectsInfos;
    turnInfos?: FeedbackTurnProps;
};

const Separator = withStyles(({ palette }) => ({
    root: {
        width: '100%',
        height: 2,
        backgroundColor: palette.background.paper
    }
}))(({ classes }: any) => <div className={classes.root} />);

const isEmptyArray = (value: unknown) => Array.isArray(value) && value.length === 0;

export const BattleFeedback: React.FC<BattleFeedbackProps> = ({
    previewEffects, futureEffects, currentEffects, turnInfos
}) => {
    const { previewEnabled } = useBattleFeedbackContext();

    const renderPreviewEffects = () => {

        if (!previewEffects) {
            return null;
        }

        return (
            <FeedbackEffectsStack
                {...previewEffects}
                opacity='animate'
            />
        );
    };

    const renderFutureEffects = () => {
        return (futureEffects ?? []).map((props, i) => (
            <FeedbackEffectsStack
                key={i}
                {...props}
                condensed
                opacity='low'
            />
        ));
    };

    const renderCurrentEffects = () => {

        if (!currentEffects) {
            return null;
        }

        return (
            <FeedbackEffectsStack {...currentEffects} condensed={previewEnabled} />
        );
    };

    const renderTurnInfos = () => {

        if (!turnInfos) {
            return null;
        }

        return (
            <FeedbackTurn {...turnInfos} />
        );
    };

    const content = [
        renderPreviewEffects(),
        renderFutureEffects(),
        renderCurrentEffects(),
        renderTurnInfos()
    ]
        .filter(node => node && !isEmptyArray(node))
        .map((node, i, list) => {
            const isLastNode = i === list.length - 1;

            return (
                <React.Fragment key={i}>
                    {node}
                    {!isLastNode && (
                        <Separator />
                    )}
                </React.Fragment>
            );
        });

    return (
        <Box display='inline-flex' flexDirection='column'>
            {content}
        </Box>
    );
};
