import { makeStyles, Popover } from '@material-ui/core';
import { RoomListSpell } from '@timeflies/socket-messages';
import { SpellButtonSimple } from '@timeflies/spell-button-panel';
import React, { SyntheticEvent } from 'react';
import { SpellDetailsPane } from './details-components';

type RoomSpellButtonProps = {
    spell: RoomListSpell;
};

const useStyles = makeStyles(() => ({
    popover: {
        pointerEvents: 'none'
    }
}));

export const RoomSpellButton: React.FC<RoomSpellButtonProps> = ({ spell }) => {
    const classes = useStyles();
    const [ anchorEl, setAnchorEl ] = React.useState<HTMLButtonElement | null>(null);

    const handlePopoverOpen: React.EventHandler<SyntheticEvent<HTMLButtonElement>> = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <SpellButtonSimple
                imageSize={28}
                padding={2}
                spellRole={spell.spellRole}
                onMouseEnter={handlePopoverOpen}
                onMouseLeave={handlePopoverClose}
                selected={false}
                disabled={false}
            />

            <Popover
                className={classes.popover}
                open={!!anchorEl}
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                <SpellDetailsPane
                    spellRole={spell.spellRole}
                    spellVariables={spell.variables}
                />
            </Popover>
        </>
    )
};
