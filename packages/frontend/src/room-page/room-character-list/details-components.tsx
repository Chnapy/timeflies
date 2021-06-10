import { Grid, makeStyles } from '@material-ui/core';
import { UIText, UITextProps, VariableIcon, VariableValue } from '@timeflies/app-ui';
import { SpellVariableName, SpellVariables, SpellCategory, SpellRole, getSpellCategory, ObjectTyped } from '@timeflies/common';
import { SpellButtonSimple } from '@timeflies/spell-button-panel';
import React from 'react';
import { DetailsPanelTemplate } from '../../battle-page/hud/details-panel/details-panel-template';

const useDetailsVariableStyles = makeStyles(() => ({
    root: {
        display: 'inline-flex',
        alignItems: 'center'
    }
}));

export const DetailsVariable: React.FC<{
    spellVariables: SpellVariables;
    variableName: SpellVariableName;
}> = ({ spellVariables, variableName }) => {
    const classes = useDetailsVariableStyles();
    const value = spellVariables[ variableName ];

    return value !== undefined
        ? (
            <Grid key={variableName} className={classes.root} item>
                <VariableIcon variableName={variableName} />
                <VariableValue variableName={variableName} value={value} colored />
            </Grid>
        ) : null;
};

const useSpellCategoryLabelStyles = makeStyles(({ palette }) => ({
    root: ({ category }: { category: SpellCategory }) => ({
        color: palette.spellCategories[ category ]
    })
}));

export const SpellCategoryLabel: React.FC<UITextProps & { category: SpellCategory }> = ({ category, ...rest }) => {
    const classes = useSpellCategoryLabelStyles({ category });

    return (
        <UIText className={classes.root} {...rest}>{category}</UIText>
    );
};

type SpellDetailsPanelProps = {
    spellRole: SpellRole;
    spellVariables: SpellVariables;
    onClose?: () => void;
};

export const SpellDetailsPane: React.FC<SpellDetailsPanelProps> = ({
    spellRole, spellVariables, onClose
}) => {
    const spellCategory = getSpellCategory(spellRole);

    return (
        <DetailsPanelTemplate width={160} onClose={onClose}>
            <Grid container direction='column' spacing={1}>

                <Grid item container justify='space-between' spacing={1} wrap='nowrap'>
                    <Grid item>
                        <UIText variant='h3'>{spellRole}</UIText>
                        <SpellCategoryLabel category={spellCategory} variant='body2' />
                    </Grid>

                    <Grid item>
                        <SpellButtonSimple
                            imageSize={28}
                            padding={2}
                            spellRole={spellRole}
                            selected={false}
                            disabled={false}
                        />
                    </Grid>
                </Grid>

                <Grid item container justify='space-between' spacing={1} alignItems='center'>
                    {ObjectTyped.keys(spellVariables).map(variableName => (
                        <DetailsVariable key={variableName} spellVariables={spellVariables} variableName={variableName} />
                    ))}
                </Grid>
            </Grid>
        </DetailsPanelTemplate>
    );
};
