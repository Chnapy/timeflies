import { Grid, makeStyles } from '@material-ui/core';
import { UIText, VariableIcon, VariableValue } from '@timeflies/app-ui';
import { getSpellCategory, ObjectTyped, SpellCategory, SpellId, SpellVariableName, SpellVariables } from '@timeflies/common';
import React from 'react';
import { useBattleSelector } from '../../store/hooks/use-battle-selector';
import { useDetailsContext, useDetailsLogic } from './details-context';
import { DetailsPanelTemplate } from './details-panel-template';
import { SpellButtonSimpleConnected } from './spell-button-simple-connected';

type InnerSpellDetailsPanelProps = {
    spellId: SpellId;
};

const useStyles = makeStyles(({ palette }) => ({
    spellIconWrapper: {
        pointerEvents: 'none'
    },
    spellCategory: ({ spellCategory }: { spellCategory: SpellCategory }) => ({
        color: palette.spellCategories[ spellCategory ]
    }),
    variableItem: {
        display: 'inline-flex',
        alignItems: 'center'
    }
}));

const InnerSpellDetailsPanel: React.FC<InnerSpellDetailsPanelProps> = React.memo(({ spellId }) => {
    const { spellClick } = useDetailsLogic();

    const spellRole = useBattleSelector(state => state.staticSpells[ spellId ].spellRole);

    const spellVariables: {
        [ name in SpellVariableName ]: SpellVariables[ name ];
    } = {
        duration: useBattleSelector(state => state.initialSerializableState.spells.duration[ spellId ]),
        rangeArea: useBattleSelector(state => state.initialSerializableState.spells.rangeArea[ spellId ]),
        actionArea: useBattleSelector(state => state.initialSerializableState.spells.actionArea[ spellId ]),
        lineOfSight: useBattleSelector(state => state.initialSerializableState.spells.lineOfSight[ spellId ]),
        attack: useBattleSelector(state => state.initialSerializableState.spells.attack[ spellId ])
    };

    const spellCategory = getSpellCategory(spellRole);

    const classes = useStyles({ spellCategory });

    const getVariableItem = (variableName: SpellVariableName) => {
        const value = spellVariables[ variableName ];

        return value !== undefined
            ? (
                <Grid key={variableName} className={classes.variableItem} item>
                    <VariableIcon variableName={variableName} />
                    <VariableValue variableName={variableName} value={value} colored />
                </Grid>

            ) : null;
    };

    return <DetailsPanelTemplate width={160} onClose={() => spellClick(null)}>
        <Grid container direction='column' spacing={1}>

            <Grid item container justify='space-between' spacing={1} wrap='nowrap'>
                <Grid item>
                    <UIText variant='h3'>{spellRole}</UIText>

                    <UIText className={classes.spellCategory} variant='body2'>{spellCategory}</UIText>
                </Grid>

                <Grid className={classes.spellIconWrapper} item>
                    <SpellButtonSimpleConnected spellId={spellId} />
                </Grid>
            </Grid>

            <Grid item container justify='space-between' spacing={1} alignItems='center'>
                {ObjectTyped.keys(spellVariables).map(getVariableItem)}
            </Grid>
        </Grid>
    </DetailsPanelTemplate>;
});

export const SpellDetailsPanel: React.FC = () => {
    const spellId = useDetailsContext().selectedSpellId;

    return spellId
        ? <InnerSpellDetailsPanel spellId={spellId} />
        : null;
};