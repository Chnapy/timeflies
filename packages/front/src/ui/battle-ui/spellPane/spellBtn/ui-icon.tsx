import FullscreenIcon from '@material-ui/icons/Fullscreen';
import HourglassFullIcon from '@material-ui/icons/HourglassFull';
import React from 'react';

const iconMap = {
    attack: FullscreenIcon,
    time: HourglassFullIcon
};

export type UIIconValue = keyof typeof iconMap;

export type UIIconProps = {
    icon: UIIconValue;
    children?: never;
};

export const UIIcon: React.FC<UIIconProps> = ({ icon }) => {

    const IconComponent = iconMap[ icon ];

    return <>
        <IconComponent />
    </>;
};
