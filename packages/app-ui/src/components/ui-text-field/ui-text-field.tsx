import { makeStyles, TextField, TextFieldProps } from '@material-ui/core';
import clsx from 'clsx';
import React from 'react';

export type UITextFieldProps = Omit<TextFieldProps, 'label'>
    & {
        center?: boolean;
    };

const useStyles = makeStyles(() => ({
    input: ({ center }: Pick<UITextFieldProps, 'center'>) => ({
        textAlign: center ? 'center' : 'initial'
    }),
    helperText: {
        fontSize: 'inherit',
        textAlign: 'center'
    }
}))

export const UITextField: React.FC<UITextFieldProps> = ({ center, ...rest }) => {
    const classes = useStyles({ center });

    return (
        <TextField
            variant='filled'
            margin="dense"
            hiddenLabel
            {...rest}
            inputProps={{
                ...rest.inputProps,
                className: clsx(classes.input, rest.inputProps?.className)
            }}
            FormHelperTextProps={{
                ...rest.FormHelperTextProps,
                className: clsx(classes.helperText, rest.FormHelperTextProps?.className)
            }}
        />
    );
};
