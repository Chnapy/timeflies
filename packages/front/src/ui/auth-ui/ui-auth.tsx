import { Box, Card, CardContent, Container, IconButton } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React from "react";
import { UITypography } from "../ui-components/typography/ui-typography";
import { UIAuthForm } from "./ui-auth-form";
import GitHubIcon from '@material-ui/icons/GitHub';

const repoLink = 'https://github.com/Chnapy/timeflies';

const useStyles = makeStyles(({ palette }) => ({
    root: {
        backgroundColor: palette.background.default,
        pointerEvents: 'all'
    }
}));

export const UIAuth: React.FC = () => {

    const classes = useStyles();

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

            <Box textAlign='right'>
                <IconButton href={repoLink} target='_blank'>
                    <GitHubIcon fontSize='large'/>
                </IconButton>
            </Box>
        </Box>
    );
};
