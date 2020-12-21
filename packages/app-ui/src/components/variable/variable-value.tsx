import { makeStyles } from '@material-ui/core/styles';
import { EntitiesVariables, EntitiesVariablesName, formatVariableValue, switchUtil } from '@timeflies/common';
import React from 'react';
import { UIText } from '../ui-text/ui-text';

type VariableValueProps<N extends EntitiesVariablesName = EntitiesVariablesName> = {
    variableName: N;
    value: Required<EntitiesVariables>[ N ];
    relative?: boolean;
    colored?: boolean;
};

const useStyles = makeStyles(({ palette }) => ({
    root: ({ variableName, colored }: Pick<VariableValueProps, 'variableName' | 'colored'>) => ({
        color: colored ? palette.variables[ variableName ] : undefined,
    }),
}));

export const VariableValue: React.FC<VariableValueProps> = ({ variableName, value, relative, colored }) => {
    const classes = useStyles({ variableName, colored });

    const formattedValue = formatVariableValue(variableName, value, { relative });

    const renderNull = () => null;

    const renderNumeric = () => (
        <UIText className={classes.root} variant='numeric'>{formattedValue}</UIText>
    );

    const renderText = () => (
        <UIText className={classes.root} variant='body2'>{formattedValue}</UIText>
    );

    return switchUtil(variableName, {
        life: renderNumeric,
        actionTime: renderNumeric,
        position: renderNull,
        orientation: renderText,
        duration: renderNumeric,
        rangeArea: renderNumeric,
        lineOfSight: renderNull,
        actionArea: renderNumeric,
        attack: renderNumeric
    })();
};
