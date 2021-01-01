import { Box, Card } from '@material-ui/core';
import { Meta } from '@storybook/react/types-6-0';
import { AssetsLoader } from '@timeflies/assets-loader';
import { Assets } from '@timeflies/static-assets';
import React from 'react';
import { SpellButton } from './spell-button';
import { SpellButtonPanel } from './spell-button-panel';

export default {
    title: 'Spell button',
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

                    <SpellButton
                        spellRole='move'
                        duration={800}
                        imageSize={56}
                        selected={false}
                        disabled={false}
                    />

                    <SpellButton
                        spellRole='switch'
                        duration={2100}
                        imageSize={56}
                        selected
                        disabled={false}
                    />

                    <SpellButton
                        spellRole='switch'
                        duration={9000}
                        imageSize={56}
                        selected={false}
                        disabled
                    />

                </Box>
            </Card>

            <Box mt={2} display='flex' justifyContent='flex-end'>
                <SpellButtonPanel
                    spellsProps={{
                        move: {
                            spellRole: 'move',
                            duration: 800,
                            selected: false,
                            disabled: false
                        },
                        simpleAttack: {
                            spellRole: 'simpleAttack',
                            duration: 2500,
                            selected: false,
                            disabled: true
                        },
                        switch: {
                            spellRole: 'switch',
                            duration: 9605,
                            selected: true,
                            disabled: false
                        }
                    }}
                    spellRoleList={[ 'move', 'simpleAttack', 'switch', 'switch' ]}
                    defaultSpellRole='move'
                />
            </Box>

        </AssetsWrapper>
    );
};
