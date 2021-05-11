import { makeStyles } from '@material-ui/core/styles';
import BorderAllIcon from '@material-ui/icons/BorderAll';
import FavoriteIcon from '@material-ui/icons/Favorite';
import FlareIcon from '@material-ui/icons/Flare';
import HourglassFullIcon from '@material-ui/icons/HourglassFull';
import OpenWithIcon from '@material-ui/icons/OpenWith';
import SignalWifi4BarIcon from '@material-ui/icons/SignalWifi4Bar';
import ZoomOutMapIcon from '@material-ui/icons/ZoomOutMap';
import { EntitiesVariablesName, switchUtil } from '@timeflies/common';
import React from 'react';

type VariableIconProps = {
    variableName: EntitiesVariablesName;
};

const useStyles = makeStyles(({ palette }) => ({
    root: ({ variableName }: VariableIconProps) => ({
        color: palette.variables[ variableName ]
    })
}));

const NoopComponent: React.FC = () => null;

export const VariableIcon: React.FC<VariableIconProps> = props => {
    const classes = useStyles(props);

    const Component = switchUtil(props.variableName, {
        // character
        health: () => FavoriteIcon,
        actionTime: () => HourglassFullIcon,
        position: () => OpenWithIcon,
        orientation: () => ZoomOutMapIcon,

        // spell
        duration: () => HourglassFullIcon,
        rangeArea: () => SignalWifi4BarIcon,
        actionArea: () => BorderAllIcon,
        lineOfSight: () => NoopComponent,
        attack: () => FlareIcon,
    })();

    return <Component className={classes.root} fontSize='inherit' />;
};
