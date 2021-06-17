import React from 'react';
import { useHotkeys as useHotkeysHook, Options } from 'react-hotkeys-hook';

const defaultOptions: Options = {
    enableOnContentEditable: false,
    filterPreventDefault: false
};

export const useHotkeysKey = (key: string, callback: () => void, options?: Options) => {
    useHotkeysHook(
        key,
        callback,
        {
            ...defaultOptions,
            ...options
        },
        [ callback ]
    );
};

/**
 * @param code with azerty a=KeyQ, escape=Escape, space=Space
 */
export const useHotkeysCode = (code: string, callback: () => void, options?: Options) => {
    useHotkeysHook(
        '*',
        callback,
        {
            filter: React.useCallback(e => e.code === code, [ code ]),
            ...defaultOptions,
            ...options
        },
        [ callback ]
    );
};
