import { AppBar, Breadcrumbs, Grid, Link, makeStyles, Toolbar } from '@material-ui/core';
import { UIText } from '@timeflies/app-ui';
import React from 'react';
import { Link as RouterLink, useHistory, useRouteMatch } from 'react-router-dom';
import { routes } from '../../routes';
import { OptionsButton } from '../options/options-button';
import { UserButton } from './user-button';

const useStyles = makeStyles(({ palette }) => ({
    root: {
        backgroundColor: palette.background.paper
    },
    title: {
        cursor: 'pointer',
        userSelect: 'none'
    }
}));

export const AppHeader: React.FC = () => {
    const classes = useStyles();
    const history = useHistory();

    const routePath = [
        useRouteMatch(routes.roomListPage()),
        useRouteMatch(routes.roomPage({})),
        useRouteMatch(routes.battlePage({}))
    ]
        .find(m => m !== null)?.path;

    const routeList = [
        {
            route: routes.roomListPage(),
            title: 'Room list'
        },
        {
            route: routes.roomPage({}),
            title: 'Room'
        },
        {
            route: routes.battlePage({}),
            title: 'Battle'
        }
    ];
    const currentRouteIndex = routeList.findIndex(({ route }) => route.path === routePath);

    const breadcrumbs = <Breadcrumbs>
        {routeList
            .slice(0, currentRouteIndex + 1)
            .map(({ route, title }, i) => {
                const isCurrent = i === currentRouteIndex;

                if (isCurrent) {
                    return (
                        <UIText key={route.path} variant='body1' color='textPrimary'>{title}</UIText>
                    );
                }

                return (
                    <Link key={route.path} component={RouterLink} color='inherit' to={route.path}>{title}</Link>
                );
            })}
    </Breadcrumbs>;

    const onTitleClick = () => {
        history.push(routes.roomListPage().path);
    };

    return (
        <AppBar className={classes.root} position="static" color='default'>
            <Toolbar variant="dense">
                <Grid container alignItems='baseline' spacing={2}>

                    <Grid item>
                        <UIText className={classes.title} variant='h3' onClick={onTitleClick}>timeflies</UIText>
                    </Grid>

                    <Grid item xs>
                        {breadcrumbs}
                    </Grid>
                </Grid>

                <div>
                    <Grid container wrap='nowrap' spacing={1}>
                        <Grid item>
                            <UserButton />
                        </Grid>

                        <Grid item>
                            <OptionsButton />
                        </Grid>
                    </Grid>
                </div>
            </Toolbar>
        </AppBar>
    );
};
