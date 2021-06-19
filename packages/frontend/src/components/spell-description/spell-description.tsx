import { makeStyles } from '@material-ui/core';
import { VariableValue } from '@timeflies/app-ui';
import { ObjectTyped, SpellRole, SpellVariables } from '@timeflies/common';
import React from 'react';
import { spellDescriptionMap, VariableTextMap } from './spell-description-map';


type SpellDescriptionProps = {
    spellRole: SpellRole;
    spellVariables: SpellVariables;
};

const useStyles = makeStyles(() => ({
    variable: {
        display: 'inline-block'
    }
}));

export const SpellDescription: React.FC<SpellDescriptionProps> = ({ spellRole, spellVariables }) => {
    const classes = useStyles();

    const variableTextMap = ObjectTyped.entries(spellVariables).reduce<VariableTextMap>((acc, [ variableName, variableValue ]) => {

        acc[ variableName ] = (cb = (v: any) => v) => {
            return <span className={classes.variable}>
                <VariableValue variableName={variableName} value={cb(variableValue)} colored />
            </span>
        };

        return acc;
    }, {} as any);

    const VariableTextComponent = spellDescriptionMap[ spellRole ].description;

    return <div>
        <VariableTextComponent {...variableTextMap} />
    </div>;
};
