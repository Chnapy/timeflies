import { action } from '@storybook/addon-actions';
import { Meta } from '@storybook/react/types-6-0';
import { AssetsLoader } from '@timeflies/assets-loader';
import { Assets } from '@timeflies/static-assets';
import { SCALE_MODES, settings } from 'pixi.js';
import React from 'react';
import { CharacterListPanel } from './character-list-panel';

settings.SCALE_MODE = SCALE_MODES.NEAREST;

export default {
    title: 'Character list panel',
} as Meta;

const AssetsWrapper: React.FC = ({ children }) => (
    <AssetsLoader
        spritesheets={Assets.spritesheets}
        maps={{}}
    >
        {children}
    </AssetsLoader>
);

export const Default: React.FC = () => {
    const extraProps = {
        onMouseEnter: action('onMouseEnter'),
        onMouseLeave: action('onMouseLeave'),
        onClick: action('onClick')
    };

    return (
        <AssetsWrapper>

            <CharacterListPanel
                characterMap={{
                    toto: {
                        characterRole: 'tacka',
                        playerName: 'chnapy',
                        playerRelation: 'me',
                        teamColor: '#44FF44',
                        health: 85,
                        isPlaying: true
                    },
                    tata: {
                        characterRole: 'meti',
                        playerName: 'boutouboufoobartotottututu',
                        playerRelation: 'ally',
                        teamColor: '#44FF44',
                        health: 52,
                        isPlaying: false
                    },
                    tutu: {
                        characterRole: 'vemo',
                        playerName: 'yoshi2oeuf',
                        playerRelation: 'enemy',
                        teamColor: '#FFFF44',
                        health: 0,
                        isPlaying: false
                    }
                }}
                characterList={['toto', 'tata', 'tutu']}
                {...extraProps}
            />
        </AssetsWrapper>
    );
};
