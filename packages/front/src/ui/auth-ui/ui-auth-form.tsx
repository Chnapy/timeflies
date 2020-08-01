import { Box } from "@material-ui/core";
import { playerNameConstraints } from "@timeflies/shared";
import React from "react";
import { useGameDispatch } from "../hooks/useGameDispatch";
import { AuthFormSubmit } from "../reducers/auth-reducers/auth-actions";
import { UIButton } from "../ui-components/button/ui-button";
import { UITextField, UITextFieldProps } from "../ui-components/text-field/ui-text-field";
import { UITypography } from "../ui-components/typography/ui-typography";

export const UIAuthForm: React.FC = () => {
    const [playerName, setPlayerName] = React.useState('');

    const onInputChange: UITextFieldProps['onChange'] = ({ currentTarget }) =>
        setPlayerName(currentTarget.value);

    const { dispatchFormSubmit } = useGameDispatch({
        dispatchFormSubmit: () => AuthFormSubmit({
            playerName
        })
    });

    const { min, max } = playerNameConstraints.length;

    const isInputError = !!playerName && playerName.length < min;
    const helperText = isInputError
        ? `Player name length should be between ${min} and ${max}.`
        : ' ';

    const isBtnDisabled = isInputError || !playerName;

    return <form
        onSubmit={e => {
            e.preventDefault();

            return dispatchFormSubmit();
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
                    helperText={helperText}
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
            >Play</UIButton>

        </Box>
    </form>;
};
