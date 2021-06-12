import { CircularProgress, Grid, makeStyles, Paper } from '@material-ui/core';
import { UIButton, UIText, UITextField } from '@timeflies/app-ui';
import { CharacterAnimatedImage } from '@timeflies/sprite-image';
import React from 'react';
import { useLoginFormState } from '../hooks/use-login-form-state';

const useStyles = makeStyles(({ spacing }) => ({
    root: {
        padding: spacing(3)
    }
}));

export const LoginForm: React.FC = () => {
    const classes = useStyles();
    const { errors, loading, onFormSubmit, onTextFieldChange, playerNameInputName, characterImageProps } = useLoginFormState();

    return (
        <Paper className={classes.root}>
            <form
                noValidate
                autoComplete='off'
                onSubmit={onFormSubmit}>
                <Grid container direction='column' spacing={3}>

                    <Grid item>
                        <UIText variant='body1'>your player name</UIText>
                    </Grid>

                    <Grid item container alignItems='center' spacing={1}>
                        <Grid item xs>
                            <UITextField
                                name={playerNameInputName}
                                disabled={loading}
                                center
                                fullWidth
                                error={!!errors.length}
                                helperText={errors.map((error, i) => <span key={error}>
                                    {i > 0 && <br />}
                                    {error}
                                </span>)}
                                onChange={onTextFieldChange}
                                autoFocus
                            />
                        </Grid>

                        <Grid item>
                            <CharacterAnimatedImage
                                size={40}
                                scale={2}
                                {...characterImageProps}
                            />
                        </Grid>
                    </Grid>

                    <Grid item>
                        <UIButton
                            variant='primary'
                            type='submit'
                            loading={loading}
                        >play</UIButton>
                    </Grid>

                </Grid>
            </form>
        </Paper>
    );
};
