import { PayloadActionCreator } from '@reduxjs/toolkit';
import { Controller } from "../Controller";

type Params = {
    [ K in string ]: PayloadActionCreator<any> | (
        (...args) => ReturnType<PayloadActionCreator<any>>
    );
};

export const serviceDispatch = <P extends Params>(map: P): P => {

    const { dispatch } = Controller.getStore();

    return Object.entries(map)
        .reduce((arr, [ key, value ]) => {

            arr[ key ] = (...args) => dispatch((value as any)(...args));

            return arr;
        }, {}) as P;
};
