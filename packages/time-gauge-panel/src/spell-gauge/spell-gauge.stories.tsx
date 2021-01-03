import { Box, Card, CardContent } from '@material-ui/core';
import { Meta } from '@storybook/react/types-6-0';
import React from 'react';
import { SpellGaugeList } from './spell-gauge-list';

export default {
    title: 'Spell gauge',
} as Meta;

const SpellGaugeSpaced: typeof SpellGaugeList = props => (
    <Box mb={0.5}>
        <SpellGaugeList {...props} />
    </Box>
);

export const Default: React.FC = () => {
    const now = Date.now();
    const future = now + 30000;

    return (
        <Box p={2}>
            <Card style={{ width: 300 }}>
                <CardContent>

                    <SpellGaugeSpaced
                        duration={13000}
                        startTime={now}
                        spellDurationList={[
                            {
                                spellCategory: 'offensive',
                                startTime: now,
                                duration: 2000
                            },
                            {
                                spellCategory: 'placement',
                                startTime: now + 2000,
                                duration: 1500
                            },
                            {
                                spellCategory: 'placement',
                                startTime: now + 4500,
                                duration: 4000
                            },
                            {
                                spellCategory: 'support',
                                startTime: now + 10000,
                                duration: 3000
                            }
                        ]}
                    />

                    <SpellGaugeSpaced
                        duration={13000}
                        startTime={future}
                        spellDurationList={[
                            {
                                spellCategory: 'offensive',
                                startTime: future,
                                duration: 2000
                            },
                            {
                                spellCategory: 'placement',
                                startTime: future + 2000,
                                duration: 1500
                            },
                            {
                                spellCategory: 'placement',
                                startTime: future + 4500,
                                duration: 4000
                            },
                            {
                                spellCategory: 'support',
                                startTime: future + 10000,
                                duration: 3000
                            }
                        ]}
                    />

                </CardContent>
            </Card>
        </Box>
    );
};
