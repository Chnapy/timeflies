import { Box } from '@material-ui/core';
import BlockIcon from '@material-ui/icons/Block';
import BorderAllIcon from '@material-ui/icons/BorderAll';
import FavoriteIcon from '@material-ui/icons/Favorite';
import FlareIcon from '@material-ui/icons/Flare';
import HourglassFullIcon from '@material-ui/icons/HourglassFull';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import SignalWifi4BarIcon from '@material-ui/icons/SignalWifi4Bar';
import React from 'react';

const iconMap = {
    attack: FlareIcon,
    time: HourglassFullIcon,
    play: PlayArrowIcon,
    life: FavoriteIcon,
    rangeArea: SignalWifi4BarIcon,
    actionArea: BorderAllIcon
} as const;

export type UIIconValue = keyof typeof iconMap;

export type UIIconProps = {
    icon: UIIconValue;
    strikeOut?: boolean;
    inPixiContext?: boolean;
    children?: never;
};

export const UIIcon: React.FC<UIIconProps> = React.memo(({ icon, strikeOut, inPixiContext }) => {

    const IconComponent = iconMap[ icon ];

    const renderIcon = () => <IconComponent style={{
        fontSize: 'inherit',
        opacity: strikeOut ? 0.75 : 1
    }} />;

    if(inPixiContext) {
        return renderIcon();
    }

    return <Box component='span' display='inline-flex' flexShrink={0} position='relative' overflow='hidden'>
        {renderIcon()}
        {strikeOut && (
            <Box position='absolute' left={0} clone>
                <BlockIcon style={{ fontSize: 'inherit' }} />
            </Box>
        )}
    </Box>;
});
