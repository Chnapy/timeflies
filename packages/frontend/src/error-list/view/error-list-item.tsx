import { Box, Collapse, makeStyles } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { useSound } from '@timeflies/app-ui';
import React from 'react';
import { useDispatch } from 'react-redux';
import { useGameSelector } from '../../store/hooks/use-game-selector';
import { ErrorListRemoveAction } from '../store/error-list-actions';

type ErrorListItemProps = { errorId: string };

const useStyles = makeStyles(() => ({
    root: {
        pointerEvents: 'all'
    }
}));

export const ErrorListItem: React.FC<ErrorListItemProps> = ({ errorId }) => {
    const classes = useStyles();
    const playSound = useSound();
    const message = useGameSelector(state => state.errorList[ errorId ].message);
    const dispatch = useDispatch();
    const [ open, setOpen ] = React.useState(true);

    const onClose = () => setOpen(false);
    const afterClose = () => {
        dispatch(ErrorListRemoveAction({ errorId }));
    };

    React.useEffect(() => {
        playSound('error');
    }, [ playSound ]);

    return (
        <Collapse in={open} appear onExited={afterClose}>
            <Box pt={1}>
                <Alert className={classes.root} severity='error' onClose={onClose}>{message}</Alert>
            </Box>
        </Collapse>
    );
};
