import { makeStyles } from '@material-ui/core/styles';
import { SpellCategory } from '@timeflies/common';
import React from 'react';
import { FeedbackContainer } from '../feedback-container';

type FeedbackEffectContainerProps = {
    spellCategory: SpellCategory;
};

const useStyles = makeStyles(({ palette }) => ({
    spellCategory: ({ spellCategory }: FeedbackEffectContainerProps) => ({
        width: 4,
        height: '100%',
        backgroundColor: palette.spellCategories[ spellCategory ]
    }),
    content: ({
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'nowrap',
        fontSize: 10,
    }),
}));

export const FeedbackEffectContainer: React.FC<FeedbackEffectContainerProps> = props => {
    const classes = useStyles(props);

    return (
        <FeedbackContainer
            left={<div className={classes.spellCategory} />}
            right={
                <div className={classes.content}>
                    {props.children}
                </div>
            }
        />
    );
};
