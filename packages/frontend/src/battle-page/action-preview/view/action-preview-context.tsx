import { Position } from '@timeflies/common';
import { SpellEffect } from '@timeflies/spell-effects';
import React from 'react';
import { useComputeActionArea } from '../hooks/use-compute-action-area';
import { useComputeSpellEffect } from '../hooks/use-compute-spell-effect';

type ActionPreviewContextValue = {
    targetPosition: Position | null;
    actionArea: Position[];
    spellEffectPreview: SpellEffect;
};

export type ActionPreviewContextValueGeo = Pick<ActionPreviewContextValue, 'targetPosition' | 'actionArea'>;

const getContextInitialValue = (): ActionPreviewContextValue => ({
    targetPosition: null,
    actionArea: [],
    spellEffectPreview: {}
});

export const ActionPreviewContext = React.createContext<ActionPreviewContextValue>(getContextInitialValue());
ActionPreviewContext.displayName = 'ActionPreviewContext';

export const ActionPreviewContextProvider: React.FC = ({ children }) => {
    const getValues = useComputeActionArea();
    const spellEffectPreview = useComputeSpellEffect(getValues)()?.spellEffect ?? {};

    return <ActionPreviewContext.Provider value={{
        ...getValues,
        spellEffectPreview
    }}>
        {children}
    </ActionPreviewContext.Provider>;
};

export const useActionPreviewContext = () => React.useContext(ActionPreviewContext);
