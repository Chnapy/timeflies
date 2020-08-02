import { Middleware, MiddlewareAPI } from "@reduxjs/toolkit";
import { SendMessageAction } from "../../../socket/wsclient-actions";

// TODO config
const refreshListInterval = 5000;

export const roomListMiddleware: Middleware = (api: MiddlewareAPI) => (next) => {

    const refreshList = async () => {
        const { step } = api.getState();

        if (step === 'roomList') {

            await api.dispatch(SendMessageAction({
                type: 'room-list/list/request'
            }));

        }

        // eslint-disable-next-line no-restricted-globals
        setTimeout(refreshList, refreshListInterval);
    };

    // eslint-disable-next-line no-restricted-globals
    setTimeout(refreshList, refreshListInterval);

    return async action => {

        return next(action);

    };
};
