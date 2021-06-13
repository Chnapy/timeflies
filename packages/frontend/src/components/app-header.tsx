import { AppBar, Button, Grid, ListItemIcon, makeStyles, Menu, MenuItem, Toolbar } from '@material-ui/core';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import PersonIcon from '@material-ui/icons/Person';
import { UIText } from '@timeflies/app-ui';
import { switchUtil } from '@timeflies/common';
import React from 'react';
import { useDispatch } from 'react-redux';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { CredentialsLoginAction } from '../login-page/store/credentials-actions';
import { routes } from '../routes';
import { useGameSelector } from '../store/hooks/use-game-selector';

const useStyles = makeStyles(({ palette, spacing }) => ({
    root: {
        backgroundColor: palette.background.paper
    },
    title: {
        cursor: 'pointer',
        userSelect: 'none'
    },
    btn: {
        textTransform: 'none',
        paddingLeft: spacing(2),
        paddingRight: spacing(2)
    }
}));

export const AppHeader: React.FC = () => {
    const classes = useStyles();
    const history = useHistory();
    const playerName = useGameSelector(state => state.credentials?.playerName);

    const routePath = [
        useRouteMatch(routes.roomListPage()),
        useRouteMatch(routes.roomPage({})),
        useRouteMatch(routes.battlePage({}))
    ]
        .find(m => m !== null)?.path;

    const dispatch = useDispatch();
    const [ anchorEl, setAnchorEl ] = React.useState<HTMLButtonElement | null>(null);

    const title = switchUtil(routePath!, {
        [ routes.roomListPage().path ]: 'Room list',
        [ routes.roomPage({}).path ]: 'Room'
    });

    const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const onTitleClick = () => {
        history.push(routes.roomListPage().path);
    };

    const handleLogout = () => {
        handleClose();
        dispatch(CredentialsLoginAction(null));
        history.push(routes.roomListPage().path);
    };

    return (
        <>
            <AppBar className={classes.root} position="static" color='default'>
                <Toolbar variant="dense">
                    <Grid container alignItems='baseline' spacing={2}>

                        <Grid item>
                            <UIText className={classes.title} variant='h3' onClick={onTitleClick}>timeflies</UIText>
                        </Grid>

                        <Grid item xs>
                            <UIText variant='body1'>{title}</UIText>
                        </Grid>
                    </Grid>
                    <Button className={classes.btn} onClick={handleClick} endIcon={<PersonIcon />}>
                        <UIText variant='body1'>{playerName}</UIText>
                    </Button>
                </Toolbar>
            </AppBar>

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
                <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                        <ExitToAppIcon />
                    </ListItemIcon>
                    Logout
                    </MenuItem>
            </Menu>
        </>
    );
};
