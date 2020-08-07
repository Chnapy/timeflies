import { Box, Card, CardContent, Container, Dialog, Grid, IconButton, Link } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import GitHubIcon from '@material-ui/icons/GitHub';
import React from "react";
import { UITypography } from "../ui-components/typography/ui-typography";
import { UIAuthForm } from "./ui-auth-form";
import { UICredits } from './ui-credits';

const repoLink = 'https://github.com/Chnapy/timeflies';

const useStyles = makeStyles(({ palette }) => ({
    root: {
        backgroundColor: palette.background.default,
        pointerEvents: 'all'
    }
}));

export const UIAuth: React.FC = () => {

    const classes = useStyles();

    const [ showCredits, setShowCredits ] = React.useState(false);

    return (
        <Box className={classes.root} display='flex' flexDirection='column' height='100%'>

            <Container maxWidth='md' style={{ height: '100%' }}>

                <Box display='flex' flexDirection='column' height='100%'
                    justifyContent='space-evenly' textAlign='center'
                >

                    <Box>
                        <UITypography variant='h1' gutterBottom>
                            Timeflies
                    </UITypography>

                        <Box />

                        <UITypography variant='h4' gutterBottom>
                            Aka time-sensitive tactical rpg
                    </UITypography>
                    </Box>

                    <Container maxWidth='sm'>
                        <Card>
                            <CardContent>

                                <UIAuthForm />

                            </CardContent>
                        </Card>
                    </Container>

                </Box>

            </Container>

            <Box display='flex' justifyContent='flex-end' alignItems='center'>
                <Grid container spacing={2} justify='flex-end' alignItems='center'>

                    <Grid item>
                        <UITypography variant='body2'>
                            <Link component='button' style={{ font: 'inherit' }} onClick={() => setShowCredits(true)}>
                                Credits
                    </Link>
                        </UITypography>
                    </Grid>

                    <Grid item>
                        <IconButton href={repoLink} target='_blank' rel='noopener' title='Github repository'>
                            <GitHubIcon fontSize='large' />
                        </IconButton>
                    </Grid>
                </Grid>
            </Box>

            <Dialog
                open={showCredits}
                onClose={() => setShowCredits(false)}
            >
                <Box py={3} px={4}>
                    <UICredits />
                </Box>
            </Dialog>
        </Box>
    );
};
