import { makeStyles } from '@material-ui/core';
import { EntitiesVariables, EntitiesVariablesName, SpellCategory } from '@timeflies/common';
import React from 'react';
import { FeedbackEffect } from './feedback-effect';
import { FeedbackEffectCondensed } from './feedback-effect-condensed';
import { FeedbackSpell, FeedbackSpellProps } from '../feedback-spell';
import clsx from 'clsx';

export type FeedbackSpellInfos = Omit<FeedbackSpellProps, 'spellCategory'>;

export type FeedbackEffectsInfos = {
    spellCategory: SpellCategory;
    variables?: Partial<EntitiesVariables>;
    spellInfos?: FeedbackSpellInfos;
};

type FeedbackEffectsStackProps = FeedbackEffectsInfos & {
    condensed?: boolean;
    opacity?: 'normal' | 'low' | 'animate';
};

const useStyles = makeStyles(() => ({
    "@keyframes opacityAnim": {
        from: {
            opacity: 0.75
        },
        to: {
            opacity: 1
        }
    },
    root: ({ opacity = 'normal' }: Pick<FeedbackEffectsStackProps, 'opacity'>) => ({
        opacity: opacity === 'low' ? 0.75 : 1,
    }),
    rootAnimated: {
        animationName: '$opacityAnim',
        animationDuration: '400ms',
        animationIterationCount: 'infinite',
        animationDirection: 'alternate'
    }
}));

export const FeedbackEffectsStack: React.FC<FeedbackEffectsStackProps> = ({
    spellCategory, variables = {}, spellInfos, condensed, opacity
}) => {
    const classes = useStyles({ opacity });

    const renderRegularEffects = () => Object.entries(variables)
        .map(([ name, value ]) => (
            <FeedbackEffect
                key={name}
                spellCategory={spellCategory}
                variableName={name as EntitiesVariablesName}
                value={value!}
            />
        ));

    const renderCondensedEffects = () => (
        <FeedbackEffectCondensed
            spellCategory={spellCategory}
            variableNameList={Object.keys(variables) as EntitiesVariablesName[]}
        />
    );

    return <div className={clsx(classes.root, {
        [ classes.rootAnimated ]: opacity === 'animate'
    })}>
        {condensed
            ? renderCondensedEffects()
            : renderRegularEffects()}

        {spellInfos && (
            <FeedbackSpell
                spellCategory={spellCategory}
                {...spellInfos}
            />
        )}
    </div>;
};
