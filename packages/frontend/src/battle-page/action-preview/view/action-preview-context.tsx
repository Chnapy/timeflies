import { Position } from '@timeflies/common';
import { SpellEffect } from '@timeflies/spell-effects';
import React from 'react';
import { useAsyncEffect } from 'use-async-effect';
import { useComputeSpellEffect } from '../hooks/use-compute-spell-effect';

type ActionPreviewContextValue = {
    targetPosition: Position | null;
    spellEffectPreview: SpellEffect;
};

export type ActionPreviewContextValueGeo = Pick<ActionPreviewContextValue, 'targetPosition'>;

const contextInitialValue: ActionPreviewContextValue = {
    targetPosition: null,
    spellEffectPreview: {
        actionArea: [],
        duration: -1
    }
};

export const ActionPreviewContext = React.createContext<ActionPreviewContextValue>(contextInitialValue);
ActionPreviewContext.displayName = 'ActionPreviewContext';

export const ActionPreviewContextProvider: React.FC = ({ children }) => {
    const [ value, setValue ] = React.useState<ActionPreviewContextValue>(contextInitialValue);

    const computePromiseRef = React.useRef<Promise<any>>();

    const getSpellEffectPreview = useComputeSpellEffect();
    const promise = React.useMemo(() => getSpellEffectPreview(), [ getSpellEffectPreview ]);
    computePromiseRef.current = promise;

    useAsyncEffect(async () => {
        const spellEffectPreviewInfos = await promise;

        // avoid promise overlapping
        if (computePromiseRef.current !== promise) {
            return;
        }

        if (!spellEffectPreviewInfos && !value.targetPosition) {
            return;
        }

        setValue(spellEffectPreviewInfos
            ? {
                targetPosition: spellEffectPreviewInfos.targetPosition,
                spellEffectPreview: spellEffectPreviewInfos.spellEffect
            }
            : contextInitialValue);
    }, [ promise ]);

    return React.useMemo(() => <ActionPreviewContext.Provider value={value}>
        {children}
    </ActionPreviewContext.Provider>, [ value, children ]);
};

export const useActionPreviewContext = () => React.useContext(ActionPreviewContext);
