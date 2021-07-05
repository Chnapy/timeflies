import { AppBar, Dialog, DialogActions, DialogTitle, Grid, IconButton, makeStyles, Toolbar } from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import { UIButton, UIText, useIsMobile } from '@timeflies/app-ui';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { UserButton } from '../../components/app-header/user-button';
import { OptionsButton } from '../../components/options/options-button';
import { routes } from '../../routes';
import { useIsSpectator } from '../hooks/use-is-spectator';

type StyleProps = { minified: boolean };

const useStyles = makeStyles(({ spacing }) => ({
    root: ({ minified }: StyleProps) => ({
        position: 'fixed',
        top: 0,
        right: 0,
        display: 'inline-flex',
        width: minified ? 'auto' : '100%'
    }),
    toolbar: {
        minHeight: 0,
        padding: spacing(0, 1)
    },
    ifExpanded: ({ minified }: StyleProps) => ({
        display: minified ? 'none' : undefined
    }),
}));

export const BattleHeader: React.FC = () => {
    const isMobile = useIsMobile();
    const [ minified, setMinified ] = React.useState(isMobile);
    const [ onConfirm, setOnConfirm ] = React.useState<(() => void) | undefined>();

    const classes = useStyles({ minified });
    const history = useHistory();
    const isSpectator = useIsSpectator();

    const toggleMinified = () => setMinified(!minified);

    const handleBack = () => {
        const fn = () => history.push(routes.roomListPage().path);

        if (isSpectator) {
            fn();
        } else {
            setOnConfirm(() => fn);
        }
    };

    const closeConfirm = () => setOnConfirm(undefined);

    React.useEffect(() => {
        setMinified(isMobile);
    }, [ isMobile ]);

    return (
        <>
            <AppBar className={classes.root} color='default'>
                <Toolbar className={classes.toolbar} disableGutters>
                    <Grid container alignItems='center' spacing={1}>
                        <Grid className={classes.ifExpanded} item xs>
                            <IconButton size='small' color="inherit" onClick={handleBack}>
                                <ArrowBackIcon />
                            </IconButton>
                        </Grid>

                        <Grid className={classes.ifExpanded} item>
                            <UIText variant="h3">timeflies</UIText>
                        </Grid>

                        <Grid item xs>
                            <Grid container justify='flex-end' spacing={1}>

                                <Grid className={classes.ifExpanded} item>
                                    <UserButton />
                                </Grid>

                                <Grid className={classes.ifExpanded} item>
                                    <OptionsButton />
                                </Grid>

                                {isMobile && (
                                    <Grid item>
                                        <IconButton size='small' color="inherit" onClick={toggleMinified}>
                                            {minified
                                                ? <KeyboardArrowLeftIcon />
                                                : <KeyboardArrowRightIcon />}
                                        </IconButton>
                                    </Grid>
                                )}

                            </Grid>
                        </Grid>
                    </Grid>
                </Toolbar>
            </AppBar>

            <Dialog open={!!onConfirm} onClose={closeConfirm}>
                <DialogTitle>Leave battle ?</DialogTitle>
                <DialogActions>
                    <UIButton onClick={onConfirm}>yes</UIButton>
                    <UIButton onClick={closeConfirm}>no</UIButton>
                </DialogActions>
            </Dialog>
        </>
    );
};
