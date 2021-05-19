import { Box, Card } from '@material-ui/core';
import { action } from '@storybook/addon-actions';
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
                        index={0}
                        duration={800}
                        imageSize={56}
                        selected={false}
                        disabled={false}
                        onClick={action('move - click')}
                        onMouseEnter={action('move - onMouseEnter')}
                        onMouseLeave={action('move - onMouseLeave')}
                    />

                    <SpellButton
                        spellRole='switch'
                        index={1}
                        duration={2100}
                        imageSize={56}
                        selected
                        disabled={false}
                        onClick={action('switch - click')}
                        onMouseEnter={action('switch - onMouseEnter')}
                        onMouseLeave={action('switch - onMouseLeave')}
                    />

                    <SpellButton
                        spellRole='switch'
                        index={2}
                        duration={9000}
                        imageSize={56}
                        selected={false}
                        disabled
                        onClick={action('switch - click')}
                        onMouseEnter={action('switch - onMouseEnter')}
                        onMouseLeave={action('switch - onMouseLeave')}
                    />

                </Box>
            </Card>

            <Box mt={2} display='flex' justifyContent='flex-end'>
                <SpellButtonPanel
                    spellsProps={{
                        s1: {
                            spellRole: 'move',
                            duration: 800,
                            selected: false,
                            disabled: false,
                            onClick: action('move - click'),
                            onMouseEnter: action('move - onMouseEnter'),
                            onMouseLeave: action('move - onMouseLeave')
                        },
                        s2: {
                            spellRole: 'simpleAttack',
                            duration: 2500,
                            selected: false,
                            disabled: true,
                            onClick: action('simpleAttack - click'),
                            onMouseEnter: action('simpleAttack - onMouseEnter'),
                            onMouseLeave: action('simpleAttack - onMouseLeave')
                        },
                        s3: {
                            spellRole: 'switch',
                            duration: 9605,
                            selected: true,
                            disabled: false,
                            onClick: action('switch - click'),
                            onMouseEnter: action('switch - onMouseEnter'),
                            onMouseLeave: action('switch - onMouseLeave')
                        }
                    }}
                    spellList={[ 's1', 's2', 's3', 's3' ]}
                    defaultSpellId='s1'
                />
            </Box>

        </AssetsWrapper>
    );
};
