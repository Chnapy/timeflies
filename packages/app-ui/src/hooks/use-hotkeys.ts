import React from 'react';
import { useHotkeys as useHotkeysHook } from 'react-hotkeys-hook';

/**
 * @param code with azerty a=KeyQ, escape=Escape, space=Space
 */
export const useHotkeys = (code: string, callback: () => void) => {
    useHotkeysHook(
        '*',
        callback,
        {
            filter: React.useCallback(e => e.code === code, [ code ])
        },
        [ callback ]
    );
};
