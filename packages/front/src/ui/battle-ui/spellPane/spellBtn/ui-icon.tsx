import { Box } from '@material-ui/core';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import HourglassFullIcon from '@material-ui/icons/HourglassFull';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import BlockIcon from '@material-ui/icons/Block';
import React from 'react';

const iconMap = {
    attack: FullscreenIcon,
    time: HourglassFullIcon,
    play: PlayArrowIcon
};

export type UIIconValue = keyof typeof iconMap;

export type UIIconProps = {
    icon: UIIconValue;
    strikeOut?: boolean;
    children?: never;
};

export const UIIcon: React.FC<UIIconProps> = React.memo(({ icon, strikeOut }) => {

    const IconComponent = iconMap[ icon ];

    return <Box display='inline-flex' position='relative' overflow='hidden'>
        <IconComponent style={{
            opacity: strikeOut ? 0.75 : 1
        }} />
        {strikeOut && (
            <Box position='absolute' left={0} clone>
                <BlockIcon />
            </Box>
        )}
    </Box>;
});
