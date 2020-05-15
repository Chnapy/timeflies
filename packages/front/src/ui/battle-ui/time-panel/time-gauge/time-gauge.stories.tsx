import { seedSpellActionSnapshot } from '@timeflies/shared';
import React from 'react';
import { StoryProps } from '../../../../../.storybook/preview';
import { seedBattleData } from '../../../../battle-data.seed';
import { seedGameState } from '../../../../game-state.seed';
import { TimeGauge } from './time-gauge';
import { seedGlobalTurn } from '../../../../stages/battle/cycle/global-turn.seed';
import { seedTurn } from '../../../../stages/battle/cycle/turn.seed';
import { seedCharacter } from '../../../../stages/battle/entities/character/Character.seed';
import { Box } from '@material-ui/core';

export default {
    title: 'Battle/Time panel/Gauge',
    component: TimeGauge
};

export const Default: React.FC<StoryProps> = ({ fakeBattleApi }) => {

    const now = Date.now();

    const initialState = seedGameState('p1', {
        step: 'battle',
        battle: seedBattleData({
            cycle: {
                launchTime: -1,
                globalTurn: seedGlobalTurn(1, {
                    currentTurn: seedTurn(1, {
                        state: 'running',
                        character: seedCharacter('fake', {
                            id: 'c1',
                            period: 'current',
                            player: null,
                            seedSpells: [
                                {
                                    id: 's1',
                                    type: 'move',
                                },
                                {
                                    id: 's2',
                                    type: 'simpleAttack'
                                }
                            ]
                        }),
                        turnDuration: 10000,
                        startTime: now,
                        getRemainingTime() { return Math.max(10000 - (Date.now() - now), 0); }
                    })
                })
            },
            future: {
                battleHash: '',
                characters: [],
                players: [],
                teams: [],
                spellActionSnapshotList: [
                    seedSpellActionSnapshot('sa0', {
                        spellId: 's1',
                        duration: 2000,
                        startTime: now,
                        characterId: 'c1'
                    }),
                    seedSpellActionSnapshot('sa1', {
                        spellId: 's1',
                        duration: 2000,
                        startTime: now + 2000,
                        characterId: 'c1'
                    }),
                    seedSpellActionSnapshot('sa1', {
                        spellId: 's2',
                        duration: 2000,
                        startTime: now + 4000,
                        characterId: 'c1'
                    })
                ]
            }
        })
    });

    const { Provider } = fakeBattleApi.init({ initialState });

    return (
        <Provider>
            <Box p={2}>
                <TimeGauge />
            </Box>
        </Provider>
    );
};
