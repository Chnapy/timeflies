import { Box } from '@material-ui/core';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import HourglassFullIcon from '@material-ui/icons/HourglassFull';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import BlockIcon from '@material-ui/icons/Block';
import FavoriteIcon from '@material-ui/icons/Favorite';
import React from 'react';

const iconMap = {
    attack: FullscreenIcon,
    time: HourglassFullIcon,
    play: PlayArrowIcon,
    life: FavoriteIcon
};

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
        opacity: strikeOut ? 0.75 : 1
    }} />;

    if(inPixiContext) {
        return renderIcon();
    }

    return <Box display='inline-flex' flexShrink={0} position='relative' overflow='hidden'>
        {renderIcon()}
        {strikeOut && (
            <Box position='absolute' left={0} clone>
                <BlockIcon />
            </Box>
        )}
    </Box>;
});
