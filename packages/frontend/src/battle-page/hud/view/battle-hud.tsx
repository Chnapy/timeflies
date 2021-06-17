import { makeStyles } from '@material-ui/core';
import React from 'react';
import { ChatPanel } from '../../../components/chat-panel/chat-panel';
import { BattleEndContextProvider } from '../battle-end-panel/battle-end-context';
import { BattleEndPanel } from '../battle-end-panel/battle-end-panel';
import { BattleFeedbackPool } from '../battle-feedbacks/view/battle-feedback-pool';
import { BattleTurnAnnoucement } from '../battle-turn-annoucement/battle-turn-annoucement';
import { CharacterHudPool } from '../character-hud/view/character-hud-pool';
import { CharacterListPanelConnected } from './character-list-panel-connected';
import { SpellButtonPanelConnected } from './spell-button-panel-connected';
import { TimeGaugePanelConnected } from './time-gauge-panel-connected';

const useStyles = makeStyles(({ breakpoints, spacing }) => ({
    characterList: {
        position: 'absolute',
        left: 0,
        bottom: 0,
        margin: spacing(1)
    },
    spellButton: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        margin: spacing(1),
        [ breakpoints.up('md') ]: {
            right: '50%',
            transform: 'translateX(50%)'
        }
    },
    timeGauge: {
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        margin: spacing(1),
        width: '30%'
    },
    chatPanel: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 168 + spacing(1),
        margin: spacing(1),
        width: 150,
        [ breakpoints.up('md') ]: {
            bottom: 0
        }
    },
    turnAnnoucement: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
    }
}));

export const BattleHud: React.FC = () => {
    const classes = useStyles();

    return <>
        <CharacterHudPool />
        <BattleFeedbackPool />

        <div className={classes.characterList}>
            <CharacterListPanelConnected />
        </div>
        <div className={classes.spellButton}>
            <SpellButtonPanelConnected />
        </div>
        <div className={classes.timeGauge}>
            <TimeGaugePanelConnected />
        </div>
        <div className={classes.chatPanel}>
            <ChatPanel onlyInputTouchable />
        </div>

        <div className={classes.turnAnnoucement}>
            <BattleTurnAnnoucement />
        </div>

        <BattleEndContextProvider>
            <BattleEndPanel />
        </BattleEndContextProvider>
    </>;
};
