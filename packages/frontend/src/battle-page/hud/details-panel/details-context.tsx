import { CharacterId, SpellId } from '@timeflies/common';
import React from 'react';

type DetailsContextValue = {
    selectedCharacterId: CharacterId | null;
    characterHoverDisabled: boolean;
    selectedSpellId: SpellId | null;
    spellHoverDisabled: boolean;
};

const getDetailsContextInitialValue = (): DetailsContextValue => ({
    selectedCharacterId: null,
    characterHoverDisabled: false,
    selectedSpellId: null,
    spellHoverDisabled: false
});

export const DetailsContext = React.createContext<DetailsContextValue>(getDetailsContextInitialValue());
DetailsContext.displayName = 'DetailsContext';

export const DetailsDispatchContext = React.createContext<React.Dispatch<Partial<DetailsContextValue>>>(undefined as any);
DetailsDispatchContext.displayName = 'DetailsDispatchContext';

export const DetailsContextProvider: React.FC = ({ children }) => {
    const [ value, dispatch ] = React.useReducer((state: DetailsContextValue, newState: Partial<DetailsContextValue>): DetailsContextValue => ({
        ...state,
        ...newState
    }), null, getDetailsContextInitialValue);

    return <DetailsContext.Provider value={value}>
        <DetailsDispatchContext.Provider value={dispatch}>
            {children}
        </DetailsDispatchContext.Provider>
    </DetailsContext.Provider>;
};

export const useDetailsContext = () => React.useContext(DetailsContext);

export const useDetailsLogic = () => {
    const { selectedCharacterId, characterHoverDisabled, selectedSpellId, spellHoverDisabled } = useDetailsContext();
    const dispatch = React.useContext(DetailsDispatchContext);

    return {
        characterHover: (characterId: CharacterId | null) => {
            if (characterHoverDisabled) {
                return;
            }

            dispatch({ selectedCharacterId: characterId === selectedCharacterId ? null : characterId });
        },
        characterClick: (characterId: CharacterId | null) => {
            dispatch(characterHoverDisabled && selectedCharacterId === characterId
                ? {
                    selectedCharacterId: null,
                    characterHoverDisabled: false
                }
                : {
                    selectedCharacterId: characterId,
                    characterHoverDisabled: true
                });
        },
        spellHover: (spellId: SpellId | null) => {
            if (spellHoverDisabled) {
                return;
            }

            dispatch({ selectedSpellId: spellId === selectedSpellId ? null : spellId });
        },
        spellClick: (spellId: SpellId | null) => {
            dispatch(spellHoverDisabled && selectedSpellId === spellId
                ? {
                    selectedSpellId: null,
                    spellHoverDisabled: false
                }
                : {
                    selectedSpellId: spellId,
                    spellHoverDisabled: true
                });
        }
    };
};
