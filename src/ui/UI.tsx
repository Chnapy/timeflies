import React from 'react';
import { connect } from 'react-redux';
import { Sort } from '../phaser/entities/Sort';
import { SortBtn } from './sortBtn/SortBtn';
import { UIState } from './UIState';
import { Character } from '../phaser/entities/Character';

interface UIProps {
    character: Character | null;
    sorts: Sort[];
}

export const UI = connect<UIProps, {}, {}, UIState>(
    state => ({
        character: state.currentCharacter,
        sorts: state.currentCharacter?.sorts || []
    })
)(class PUI extends React.Component<UIProps> {

    render() {
        const { character } = this.props;

        return <div>

            {character
                ? <div>

                    <div>
                        {character.sorts.map(s => <SortBtn key={s.type} sort={s} />)}
                    </div>

                    <table>
                        <caption style={character.isMine
                            ? { fontWeight: 600 }
                            : undefined}>{character.name} - {character.type}</caption>
                        <thead>
                            <tr>
                                <th>life</th>
                                <th>position</th>
                                <th>actionTime</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{character.life}</td>
                                <td>{character.position.x} - {character.position.y}</td>
                                <td>{character.actionTime}</td>
                            </tr>
                        </tbody>
                    </table>

                </div>
                : <div>
                    No character playing
                </div>}

        </div>
    }
});


