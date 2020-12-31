import { makeStyles } from '@material-ui/core/styles';
import { EntitiesVariablesName, switchUtil } from '@timeflies/common';
import FavoriteIcon from '@material-ui/icons/Favorite';
import HourglassFullIcon from '@material-ui/icons/HourglassFull';
import React from 'react';

type VariableIconProps = {
    variableName: EntitiesVariablesName;
};

const useStyles = makeStyles(({ palette }) => ({
    root: ({ variableName }: VariableIconProps) => ({
        color: palette.variables[ variableName ]
    })
}));

export const VariableIcon: React.FC<VariableIconProps> = props => {
    const classes = useStyles(props);

    const NoopComponent: React.FC = () => null;

    // TODO
    const Component = switchUtil(props.variableName, {
        // character
        health: () => FavoriteIcon,
        actionTime: () => HourglassFullIcon,
        position: () => NoopComponent,
        orientation: () => NoopComponent,

        // spell
        duration: () => HourglassFullIcon,
        rangeArea: () => NoopComponent,
        actionArea: () => NoopComponent,
        lineOfSight: () => NoopComponent,
        attack: () => NoopComponent,
    })();

    return <Component className={classes.root} fontSize='inherit' />;
};
