import { useTheme } from '@material-ui/core';
import { logger } from '@timeflies/devtools';
import React from 'react';
import { useAsyncEffect } from 'use-async-effect';

const OrientationLockDispatchContext = React.createContext<React.Dispatch<boolean>>(() => { });
OrientationLockDispatchContext.displayName = 'OrientationLockDispatchContext';

const disableFullscreen = async () => {
    if (globalThis.document.fullscreenElement) {
        await globalThis.document.exitFullscreen();
    }
};

export const OrientationLockContextProvider: React.FC = ({ children }) => {
    const { breakpoints } = useTheme();
    const [ locked, dispatch ] = React.useReducer((prevValue: boolean, nextValue: boolean) => {
        if (prevValue === nextValue) {
            return prevValue;
        }

        const isMobileLike = globalThis.matchMedia(
            `(max-width: ${breakpoints.values.md}px)`
        ).matches;

        if (!isMobileLike) {
            return false;
        }

        return nextValue;
    }, false);

    useAsyncEffect(async isMounted => {

        if (locked) {

            const requestFullscreenThenLock = async (handlePageFirstLoad: boolean) => {

                const requestFullscreen = () => globalThis.document.body.requestFullscreen({ navigationUI: 'show' });

                if (handlePageFirstLoad) {

                    try {
                        await requestFullscreen();
                    } catch (err) {
                        // fullscreen fails on page load
                        if (err instanceof TypeError) {
                            const eventListener = async () => {
                                globalThis.document.body.removeEventListener('touchstart', eventListener);
                                await requestFullscreenThenLock(false);
                            };

                            globalThis.document.body.addEventListener('touchstart', eventListener);
                            return;

                        } else {
                            throw err;
                        }
                    }

                } else {
                    await requestFullscreen();
                }

                if (!isMounted()) {
                    return;
                }

                try {
                    await globalThis.screen.orientation.lock('landscape');
                } catch (e) {
                    logger.error(e);

                    await disableFullscreen();
                }
            };

            await requestFullscreenThenLock(true);

        } else {
            globalThis.screen.orientation.unlock();

            await disableFullscreen();
        }

    }, [ locked ]);

    return <OrientationLockDispatchContext.Provider value={dispatch}>
        {children}
    </OrientationLockDispatchContext.Provider>;
};

export const useOrientationLockSetter = (locked: boolean) => {
    const dispatch = React.useContext(OrientationLockDispatchContext);

    React.useEffect(() => {
        dispatch(locked);
    }, [ dispatch, locked ]);
};
