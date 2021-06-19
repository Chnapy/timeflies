import { Box } from '@material-ui/core';
import { Meta } from '@storybook/react/types-6-0';
import { SpellRole } from '@timeflies/common';
import React from 'react';
import { SpellDescription } from './spell-description';

export default {
    title: 'UI/Spell description',
} as Meta;

export const Default: React.FC = () => {

    const spellRoles: SpellRole[] = [
        'simpleAttack',
        'move',
        'sword-sting',
        'side-attack',
        'blood-sharing',
        'switch',
        'treacherous-blow',
        'attraction',
        'distraction',
        'slump',
        'last-resort',
        'motivation'
    ];

    return (
        <Box p={2}>
            {spellRoles.map(spellRole => <Box key={spellRole} mt={1}>
                {spellRole}:
                <SpellDescription
                    spellRole={spellRole}
                    spellVariables={{
                        duration: 5100,
                        rangeArea: 2,
                        actionArea: 0,
                        lineOfSight: true,
                        attack: 20
                    }}
                />
            </Box>)}
        </Box>
    );
};
