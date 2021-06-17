import { makeStyles } from '@material-ui/core';
import { TimeProps } from '@timeflies/app-ui';
import { EntitiesVariables, EntitiesVariablesName, getSpellCategory, SpellRole } from '@timeflies/common';
import clsx from 'clsx';
import React from 'react';
import { FeedbackSpell } from '../feedback-spell';
import { FeedbackEffect } from './feedback-effect';
import { FeedbackEffectCondensed } from './feedback-effect-condensed';

export type FeedbackEffectsInfos<T extends TimeProps = TimeProps> = {
    spellRole: SpellRole;
    variables?: Partial<EntitiesVariables>;
    spellInfos?: T;
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
        animationDuration: '250ms',
        animationIterationCount: 'infinite',
        animationDirection: 'alternate',
        animationTimingFunction: 'steps(2, jump-none)'
    }
}));

export const FeedbackEffectsStack: React.FC<FeedbackEffectsStackProps> = ({
    spellRole, variables = {}, spellInfos, condensed, opacity
}) => {
    const classes = useStyles({ opacity });

    const spellCategory = getSpellCategory(spellRole);

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
            <FeedbackSpell spellRole={spellRole} {...spellInfos}/>
        )}
    </div>;
};
