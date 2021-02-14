import { Box, Card } from '@material-ui/core';
import { Meta } from '@storybook/react/types-6-0';
import { AssetsLoader } from '@timeflies/assets-loader';
import { Assets } from '@timeflies/static-assets';
import { SCALE_MODES, settings } from 'pixi.js';
import React from 'react';
import { CharacterItem } from './character-item';

settings.SCALE_MODE = SCALE_MODES.NEAREST;

export default {
    title: 'Character item',
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
    return (
        <AssetsWrapper>
            <Card>
                <Box display='flex' justifyContent='space-around' p={2}>

                    <CharacterItem
                        characterRole='tacka'
                        playerName='chnapy'
                        playerRelation='me'
                        teamColor='#44FF44'
                        health={85}
                        isPlaying={false}
                    />

                    <CharacterItem
                        characterRole='meti'
                        playerName='boutoubou'
                        playerRelation='ally'
                        teamColor='#44FF44'
                        health={65}
                        isPlaying={false}
                    />

                    <CharacterItem
                        characterRole='meti'
                        playerName='yoshi2oeuf'
                        playerRelation='enemy'
                        teamColor='#FFFF44'
                        health={25}
                        isPlaying={false}
                    />

                    <CharacterItem
                        characterRole='tacka'
                        playerName='chnapy'
                        playerRelation='me'
                        teamColor='#44FF44'
                        health={0}
                        isPlaying={false}
                    />

                    <CharacterItem
                        characterRole='tacka'
                        playerName='verylongnametoto'
                        playerRelation='me'
                        teamColor='#44FF44'
                        health={85}
                        isPlaying
                    />

                    <CharacterItem
                        characterRole='meti'
                        playerName='boutoubou'
                        playerRelation='ally'
                        teamColor='#44FF44'
                        health={65}
                        isPlaying
                    />

                    <CharacterItem
                        characterRole='meti'
                        playerName='yoshi2oeuf'
                        playerRelation='enemy'
                        teamColor='#FFFF44'
                        health={25}
                        isPlaying
                    />

                    <CharacterItem
                        characterRole='tacka'
                        playerName='chnapy'
                        playerRelation='me'
                        teamColor='#44FF44'
                        health={0}
                        isPlaying
                    />

                </Box>
            </Card>
        </AssetsWrapper>
    );
};
