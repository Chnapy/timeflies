import React from 'react';
import { connect } from 'react-redux';
import { Character, Position } from '../phaser/entities/Character';
import { SpellPane } from './spells/SpellPane';
import { UIState } from './UIState';

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

        return <div style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            pointerEvents: 'none'
        }}>

            {character
                ? <div style={{
                    pointerEvents: 'all'
                }}>

                    <SpellPane/>

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


