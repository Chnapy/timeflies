import { Middleware, MiddlewareAPI } from "@reduxjs/toolkit";
import { AuthResponseBody, getEndpoint } from "@timeflies/shared";
import { envManager } from "../../../envManager";
import { AuthFormSubmit, AuthHttpSuccess } from "./auth-actions";

const endpoint = getEndpoint('http', envManager.REACT_APP_SERVER_URL);

export const authMiddleware: Middleware = (api: MiddlewareAPI) => (next) => {

    const submitForm = async ({ payload }: AuthFormSubmit) => {
        const { playerName } = payload;

        // TODO use url-join or others
        const res = await fetch(endpoint + '/auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                playerName
            }),
        });

        if (res.ok) {

            const resBody: AuthResponseBody = await res.json();

            if (resBody.success) {

                const { token } = resBody;

                await api.dispatch(AuthHttpSuccess({
                    playerName,
                    token
                }));
            }

        } else {

            console.error('auth failed');
            try {
                console.error(await res.json());

                // TODO handle errors
            } catch (e) { }
        }
    };

    return async (action) => {

        const ret = next(action);

        if (AuthFormSubmit.match(action)) {
            await submitForm(action);
        }

        await ret;
    };
};
