import { Box, Card } from '@material-ui/core';
import { Meta } from '@storybook/react/types-6-0';
import { AssetsLoader } from '@timeflies/assets-loader';
import { createPosition } from '@timeflies/common';
import { Assets } from '@timeflies/static-assets';
import React from 'react';
import { BattleFeedback } from './battle-feedback';
import { BattleFeedbackContextProvider } from './battle-feedback-context';
import { FeedbackContainer } from './feedback-container';
import { FeedbackEffect } from './feedback-effects/feedback-effect';
import { FeedbackEffectCondensed } from './feedback-effects/feedback-effect-condensed';
import { FeedbackEffectsStack } from './feedback-effects/feedback-effects-stack';
import { FeedbackSpell } from './feedback-spell';
import { FeedbackTurn } from './feedback-turn';

export default {
    title: 'Feedback',
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
    const now = Date.now() + 9000;

    return (
        <AssetsWrapper>
            <Box display='flex' justifyContent='space-around' p={2}>
                <BattleFeedback
                    futureEffects={[
                        {
                            spellRole: 'simpleAttack',
                            variables: {
                                life: -12,
                                actionTime: -2100
                            },
                            spellInfos: {
                                duration: 3123
                            }
                        },
                        {
                            spellRole: 'switch',
                            variables: {
                                life: -12,
                                actionTime: -2100
                            },
                            spellInfos: {
                                duration: 3123
                            }
                        }
                    ]}
                    currentEffects={{
                        spellRole: 'switch',
                        variables: {
                            life: -12,
                            actionTime: -2100
                        },
                        spellInfos: {
                            startTime: now,
                            duration: 3123
                        }
                    }}
                    turnInfos={{
                        startTime: now,
                        duration: 12087
                    }}
                />

                <BattleFeedbackContextProvider value={{ previewEnabled: true }}>
                    <BattleFeedback
                        previewEffects={{
                            spellRole: 'simpleAttack',
                            variables: {
                                life: -12,
                                actionTime: -2100
                            },
                            spellInfos: {
                                duration: 3123
                            }
                        }}
                        currentEffects={{
                            spellRole: 'switch',
                            variables: {
                                life: -12,
                                actionTime: -2100
                            },
                            spellInfos: {
                                startTime: now,
                                duration: 3123
                            }
                        }}
                        turnInfos={{
                            startTime: now,
                            duration: 12087
                        }}
                    />

                    <BattleFeedback
                        previewEffects={{
                            spellRole: 'simpleAttack',
                            variables: {
                                life: -12,
                            }
                        }}
                        futureEffects={[
                            {
                                spellRole: 'simpleAttack',
                                variables: {
                                    life: -12,
                                }
                            },
                            {
                                spellRole: 'simpleAttack',
                                variables: {
                                    life: -12,
                                }
                            }
                        ]}
                        currentEffects={{
                            spellRole: 'simpleAttack',
                            variables: {
                                life: -12,
                            },
                        }}
                    />
                </BattleFeedbackContextProvider>
            </Box>
        </AssetsWrapper>
    );
};

export const Container: React.FC = () => {

    const renderRect = (height: number, color: string) => (
        <Box display='inline-block' height={height} width={20} bgcolor={color} />
    );

    return (
        <Card>
            <Box p={2}>
                <FeedbackContainer
                    left={renderRect(20, '#F00')}
                    right={renderRect(20, '#0F0')}
                    bottom={renderRect(8, '#00F')}
                />
            </Box>
        </Card>
    );
};

export const Effect: React.FC = () => {

    return (
        <Card>
            <Box p={2}>
                <FeedbackEffect
                    spellCategory='offensive'
                    variableName='life'
                    value={-12}
                />
                <FeedbackEffect
                    spellCategory='support'
                    variableName='actionTime'
                    value={+2100}
                />
                <FeedbackEffect
                    spellCategory='placement'
                    variableName='position'
                    value={createPosition(2, 3)}
                />
                <FeedbackEffect
                    spellCategory='placement'
                    variableName='orientation'
                    value='right'
                />
            </Box>
        </Card>
    );
};

export const EffectCondensed: React.FC = () => {

    return (
        <Card>
            <Box p={2}>
                <FeedbackEffectCondensed
                    spellCategory='offensive'
                    variableNameList={[ 'life', 'actionTime' ]}
                />
                <FeedbackEffectCondensed
                    spellCategory='support'
                    variableNameList={[ 'life', 'position', 'orientation', 'actionTime' ]}
                />
            </Box>
        </Card>
    );
};

export const Spell: React.FC = () => {
    const now = Date.now();
    const before = now - 1230;

    return (
        <AssetsWrapper>
            <Card>
                <Box p={2}>
                    <FeedbackSpell
                        spellRole='move'
                        startTime={now}
                        duration={1200}
                    />
                    <FeedbackSpell
                        spellRole='move'
                        startTime={before}
                        duration={6200}
                    />
                </Box>
            </Card>
        </AssetsWrapper>
    );
};

export const Turn: React.FC = () => {
    const now = Date.now();
    const before = now - 1230;

    return (
        <Card>
            <Box p={2}>
                <FeedbackTurn
                    startTime={now}
                    duration={1200}
                />
                <FeedbackTurn
                    startTime={before}
                    duration={6200}
                />
            </Box>
        </Card>
    );
};

export const Stack: React.FC = () => {
    const now = Date.now();


    return (
        <Card>
            <Box display='flex' p={2} justifyContent='space-around'>
                <FeedbackEffectsStack
                    spellRole='move'
                    variables={{
                        life: -12,
                        actionTime: 2100,
                        orientation: 'left'
                    }}
                    spellInfos={{
                        startTime: now,
                        duration: 2435
                    }}
                />

                <FeedbackEffectsStack
                    spellRole='move'
                    variables={{
                        life: -12,
                        actionTime: 2100,
                        orientation: 'left'
                    }}
                    spellInfos={{
                        startTime: now,
                        duration: 2435
                    }}
                    condensed
                />

                <FeedbackEffectsStack
                    spellRole='move'
                    variables={{
                        life: -12,
                        actionTime: 2100,
                        orientation: 'left'
                    }}
                    spellInfos={{
                        startTime: now,
                        duration: 2435
                    }}
                    condensed
                    opacity='low'
                />

                <FeedbackEffectsStack
                    spellRole='move'
                    variables={{
                        life: -12,
                        actionTime: 2100,
                        orientation: 'left'
                    }}
                    spellInfos={{
                        startTime: now,
                        duration: 2435
                    }}
                    opacity='animate'
                />
            </Box>
        </Card>
    );
};
