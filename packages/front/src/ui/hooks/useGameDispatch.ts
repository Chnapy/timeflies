import { PayloadActionCreator } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';

type Params = {
    [ K in string ]: PayloadActionCreator<any> | (
        (...args) => ReturnType<PayloadActionCreator<any>>
    );
};

export const useGameDispatch = <P extends Params>(map: P): P => {

    const dispatch = useDispatch();

    return Object.entries(map)
        .reduce((arr, [ key, value ]) => {

            arr[ key ] = (...args) => dispatch((value as any)(...args));

            return arr;
        }, {}) as P;
};
