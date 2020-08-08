import { Box, CircularProgress } from "@material-ui/core";
import { playerNameConstraints, AuthResponseBodyError } from "@timeflies/shared";
import React from "react";
import { useGameDispatch } from "../hooks/useGameDispatch";
import { AuthFormSubmit } from "../reducers/auth-reducers/auth-actions";
import { UIButton } from "../ui-components/button/ui-button";
import { UITextField, UITextFieldProps } from "../ui-components/text-field/ui-text-field";
import { UITypography } from "../ui-components/typography/ui-typography";

const { min, max } = playerNameConstraints.length;

type InputError = AuthResponseBodyError | 'length' | 'unknown';

const helperTextMap: Record<
    InputError, (value: string) => string
> = {
    unknown: () => `An unexpected error occured, please try again.`,
    length: () => `Player name length should be between ${min} and ${max}.`,
    "player-name-exist": value => `Player with name "${value}" already exist.`
};

export const UIAuthForm: React.FC = () => {
    const [ playerName, setPlayerName ] = React.useState('');
    const [ inputError, setInputError ] = React.useState<InputError | null>(null);
    const [ submitLoading, setSubmitLoading ] = React.useState(false);

    const onInputChange: UITextFieldProps[ 'onChange' ] = ({ currentTarget }) => {
        setPlayerName(currentTarget.value);
        if (currentTarget.value.length < min) {
            setInputError('length');
        } else {
            setInputError(null);
        }
    };

    const { dispatchFormSubmit } = useGameDispatch({
        dispatchFormSubmit: () => AuthFormSubmit({
            playerName
        })
    });

    const helperText = inputError
        && (helperTextMap[ inputError ] ?? helperTextMap.unknown)(playerName);
    const isInputError = !!inputError;

    const isBtnDisabled = isInputError || !playerName || submitLoading;

    return <form
        onSubmit={e => {
            e.preventDefault();

            setSubmitLoading(true);

            return dispatchFormSubmit()
                .catch((err?: AuthResponseBodyError) => {
                    setInputError(err ?? 'unknown');
                })
                .finally(() => setSubmitLoading(false));
        }}
        spellCheck={false}
        autoCorrect='off'
    >
        <Box display='flex' flexDirection='column'>

            <UITypography variant='h4' gutterBottom>
                Your player name
        </UITypography>

            <Box mt={3} mb={2} display='inherit' flexDirection='inherit'>
                <UITextField
                    value={playerName}
                    onChange={onInputChange}
                    error={isInputError}
                    helperText={helperText ?? ' '}
                    autoFocus
                    inputProps={{
                        maxLength: max,
                        style: { textAlign: 'center' }
                    }}
                    FormHelperTextProps={{
                        style: { textAlign: 'center' }
                    }}
                />
            </Box>

            <UIButton
                variant='primary'
                type='submit'
                disabled={isBtnDisabled}
                startIcon={submitLoading && <CircularProgress color='inherit' size='1em' />}
            >Play</UIButton>

        </Box>
    </form>;
};
