import { CharacterId, createPosition, ObjectTyped, Position } from '@timeflies/common';
import * as PIXI from 'pixi.js';
import React from 'react';

type CharactersPositionsContextValue = {
    sprites: {
        [ characterId in CharacterId ]?: PIXI.Sprite;
    };
    positions: {
        [ characterId in CharacterId ]?: Position;
    };
};

const getInitialContextValue = (): CharactersPositionsContextValue => ({
    sprites: {},
    positions: {}
});

// to handle simultaneous dispatch without conflict
let persistentContextValue: CharactersPositionsContextValue = getInitialContextValue();

export const CharactersPositionsContext = React.createContext<CharactersPositionsContextValue>(persistentContextValue);
CharactersPositionsContext.displayName = 'CharactersPositionsContext';

export const CharactersPositionsDispatchContext = React.createContext<React.Dispatch<CharactersPositionsContextValue>>(undefined as any);
CharactersPositionsDispatchContext.displayName = 'CharactersPositionsDispatchContext';

export const CharactersPositionsContextProvider: React.FC = ({ children }) => {
    const [ value, dispatch ] = React.useState<CharactersPositionsContextValue>(persistentContextValue);

    React.useEffect(() => {
        return () => {
            persistentContextValue = getInitialContextValue();
        };
    }, []);

    return <CharactersPositionsContext.Provider value={value}>
        <CharactersPositionsDispatchContext.Provider value={dispatch}>
            {children}
        </CharactersPositionsDispatchContext.Provider>
    </CharactersPositionsContext.Provider>;
};

export const useCharactersPositionsContext = () => React.useContext(CharactersPositionsContext).positions;
export const useCharactersPositionsDispatchContext = (characterId?: CharacterId) => {
    const dispatch = React.useContext(CharactersPositionsDispatchContext);

    return React.useCallback((sprite?: PIXI.Sprite) => {
        const newSprites = characterId && sprite
            ? {
                ...persistentContextValue.sprites,
                [ characterId ]: sprite
            }
            : { ...persistentContextValue.sprites };

        const newPositions = ObjectTyped.entries(newSprites).reduce((acc, [ characterId, sprite ]) => {
            if (sprite) {
                const globalPos = sprite.getGlobalPosition();
                const pos = createPosition(globalPos.x, globalPos.y);
                if (acc[ characterId ]?.id !== pos.id) {
                    acc[ characterId ] = pos;
                }
            }

            return acc;
        }, { ...persistentContextValue.positions });

        persistentContextValue = {
            sprites: newSprites,
            positions: newPositions
        };

        dispatch(persistentContextValue);
    }, [ dispatch, characterId ]);
};
