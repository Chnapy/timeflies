import { makeStyles, Paper } from '@material-ui/core';
import CropFreeIcon from '@material-ui/icons/CropFree';
import { UIButton, UIButtonProps } from '@timeflies/app-ui';
import { CharacterId } from '@timeflies/common';
import React from 'react';
import { RoomCharacterButton } from '../room-team/room-character-button';

type RoomMapPlacementTileProps = Pick<UIButtonProps, 'onClick' | 'disabled'> & {
    x: number;
    y: number;
    size: number;
    teamColor: string;
    characterId?: CharacterId;
    showIcon?: boolean;
};

type StyleProps = Pick<RoomMapPlacementTileProps, 'x' | 'y' | 'size' | 'teamColor'>;

const outlineWidth = 2;

const useStyles = makeStyles(() => ({
    root: ({ x, y, size, teamColor }: StyleProps) => ({
        position: 'absolute',
        width: size - outlineWidth * 2,
        height: size - outlineWidth * 2,
        left: 0,
        top: 0,
        transform: `translate(${x + outlineWidth}px, ${y + outlineWidth}px)`,
        outlineColor: teamColor,
        outlineWidth: outlineWidth,
        outlineStyle: 'solid'
    }),
    btn: {
        width: '100%',
        height: '100%',
        minWidth: 0,
        padding: 0
    },
    btnIcon: {
        verticalAlign: 'text-bottom'
    }
}));

export const RoomMapPlacementTile: React.FC<RoomMapPlacementTileProps> = ({ x, y, size, teamColor, onClick, disabled, characterId, showIcon }) => {
    const classes = useStyles({ x, y, size, teamColor });

    const getContent = () => {
        if (characterId) {
            return (
                <RoomCharacterButton
                    characterId={characterId}
                    onClick={onClick}
                    disabled={disabled}
                    size={size - outlineWidth * 2}
                    borderWidth={3}
                    scale={1.2}
                />
            );
        }

        return (
            <UIButton
                className={classes.btn}
                disabled={disabled}
                onClick={onClick}
            >
                {showIcon && <CropFreeIcon className={classes.btnIcon} />}
            </UIButton>
        );
    };

    return (
        <Paper className={classes.root}>
            {getContent()}
        </Paper>
    );
};
