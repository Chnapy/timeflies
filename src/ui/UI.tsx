import React from 'react';
import { connect } from 'react-redux';
import { Sort } from '../phaser/entities/Sort';
import { SortBtn } from './sorts/SortBtn';
import { UIState } from './UIState';
import { Character, Position } from '../phaser/entities/Character';
import { SortPane } from './sorts/SortPane';

interface UIProps {
    character: Character | null;
    position?: Position;
}

export const UI = connect<UIProps, {}, {}, UIState>(
    state => ({
        character: state.currentCharacter,
        position: state.currentCharacter?.position
    })
)(class PUI extends React.Component<UIProps> {

    render() {
        const { character, position } = this.props;

        return <div>

            {character
                ? <div>

                    <SortPane/>

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
                                <td>{position!.x} - {position!.y}</td>
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


