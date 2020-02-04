import React from 'react';
import css from './charactersPane.module.css';
import { connect } from 'react-redux';
import { CharacterItem } from './characterItem/CharacterItem';
import { UIState } from '../../UIState';

interface CharactersPaneInnerProps {
    charactersIds: string[];
}

export const CharactersPane = connect<CharactersPaneInnerProps, {}, {}, UIState<'battle'>>(
    ({ data: { battleData: { characters, globalTurn } } }) => {
        const charactersIds = characters
            .map(c => c.id)
            .sort((a, b) => globalTurn?.currentTurn?.currentCharacter.id === a ? -1 : 1);

        return {
            charactersIds
        };
    }
)(({
    charactersIds
}: CharactersPaneInnerProps) => {

    return <div className={css.root}>

        {charactersIds.map(id => <CharacterItem key={id} characterId={id} />)}

    </div>
});
