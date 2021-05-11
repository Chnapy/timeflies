import { makeStyles } from '@material-ui/core/styles';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import { EntitiesVariables, EntitiesVariablesName, formatVariableValue, Orientation, switchUtil } from '@timeflies/common';
import React from 'react';
import { UIText } from '../ui-text/ui-text';

export type VariableValueProps<N extends EntitiesVariablesName = EntitiesVariablesName> = {
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

    const renderLineOfSight = () => formattedValue
        ? <VisibilityIcon fontSize='inherit' />
        : <VisibilityOffIcon fontSize='inherit' />;

    // const renderText = () => (
    //     <UIText className={classes.root} variant='body2'>{formattedValue}</UIText>
    // );

    const renderOrientation = () => switchUtil(value as Orientation, {
        bottom: <KeyboardArrowDownIcon />,
        top: <KeyboardArrowUpIcon />,
        left: <KeyboardArrowLeftIcon />,
        right: <KeyboardArrowRightIcon />
    });

    return switchUtil(variableName, {
        health: renderNumeric,
        actionTime: renderNumeric,
        position: renderNull,
        orientation: renderOrientation,
        duration: renderNumeric,
        rangeArea: renderNumeric,
        lineOfSight: renderLineOfSight,
        actionArea: renderNumeric,
        attack: renderNumeric
    })();
};
