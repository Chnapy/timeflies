import { CardActionArea, Grid, ListItemIcon, makeStyles, Menu, MenuItem } from '@material-ui/core';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import PersonIcon from '@material-ui/icons/Person';
import { UIText, useWithSound } from '@timeflies/app-ui';
import React from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { CredentialsLoginAction } from '../../login-page/store/credentials-actions';
import { routes } from '../../routes';
import { useGameSelector } from '../../store/hooks/use-game-selector';

const useStyles = makeStyles(({ spacing }) => ({
    root: {
        display: 'inline-block',
        width: 'auto',
        padding: spacing(0, 1)
    },
    icon: {
        verticalAlign: 'middle'
    }
}));

export const UserButton: React.FC = () => {
    const classes = useStyles();
    const withSound = useWithSound('buttonClick');
    const history = useHistory();
    const playerName = useGameSelector(state => state.credentials?.playerName);

    const dispatch = useDispatch();
    const [ anchorEl, setAnchorEl ] = React.useState<HTMLButtonElement | null>(null);

    const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleClose();
        dispatch(CredentialsLoginAction(null));
        history.push(routes.roomListPage().path);
    };

    return <>
        <CardActionArea className={classes.root} onClick={withSound(handleClick)}>
            <Grid container alignItems='center' wrap='nowrap' spacing={1}>
                <Grid item>
                    <UIText variant='body1'>{playerName}</UIText>
                </Grid>
                <Grid item>
                    <PersonIcon className={classes.icon} />
                </Grid>
            </Grid>
        </CardActionArea>

        <Menu
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
            getContentAnchorEl={null}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
        >
            <MenuItem onClick={withSound(handleLogout)}>
                <ListItemIcon>
                    <ExitToAppIcon />
                </ListItemIcon>
                    Logout
                    </MenuItem>
        </Menu>
    </>;
};
