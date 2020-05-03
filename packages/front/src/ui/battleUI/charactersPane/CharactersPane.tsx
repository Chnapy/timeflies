import React from 'react';
import css from './charactersPane.module.css';
import { connect } from 'react-redux';
import { CharacterItem } from './characterItem/CharacterItem';
import { GameState } from '../../../game-state';

interface CharactersPaneInnerProps {
    charactersIds: string[];
}

export const CharactersPane = connect<CharactersPaneInnerProps, {}, {}, GameState>(
    ({ battle: battleData }) => {
        const { globalTurn } = battleData!.cycle;
        const { characters } = battleData!.current;
        const charactersIds = characters
            .map(c => c.id)
            .sort((a, b) => globalTurn?.currentTurn.character.id === a ? -1 : 1);

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
