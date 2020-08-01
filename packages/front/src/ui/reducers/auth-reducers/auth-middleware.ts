import { Middleware, MiddlewareAPI } from "@reduxjs/toolkit";
import { authEndpoint, AuthRequestBody, AuthResponseBody, getEndpoint } from "@timeflies/shared";
import { envManager } from "../../../envManager";
import { AuthFormSubmit, AuthHttpSuccess } from "./auth-actions";

const authHref = new URL(
    authEndpoint,
    getEndpoint('http', envManager.REACT_APP_SERVER_URL)
).href;

export const authMiddleware: Middleware = (api: MiddlewareAPI) => (next) => {

    const submitForm = async ({ payload }: AuthFormSubmit) => {
        const { playerName } = payload;

        const bodyRaw: AuthRequestBody = {
            playerName
        };

        const res = await fetch(authHref, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bodyRaw),
        });

        if (res.ok) {

            const resBody: AuthResponseBody = await res.json();

            const { token } = resBody;

            await api.dispatch(AuthHttpSuccess({
                playerName,
                token
            }));

        } else {

            console.error('auth failed');
            try {
                const resBody: AuthResponseBody = await res.json();

                return Promise.reject(resBody.error);
            } catch (e) {
                return Promise.reject();
            }
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
