import { Backdrop, CircularProgress } from '@material-ui/core';
import React from 'react';

export const LoadingBackdrop: React.FC = () => {

    return <Backdrop open>
        <CircularProgress color='inherit' />
    </Backdrop>;
};
