import { makeStyles } from '@material-ui/core';
import React from 'react';
import { ChatPanel } from '../../../components/chat-panel/chat-panel';
import { BattleHeader } from '../../battle-header/battle-header';
import { useIsSpectator } from '../../hooks/use-is-spectator';
import { BattleAnnouncementList } from '../battle-announcement-list/battle-announcement-list';
import { BattleEndContextProvider } from '../battle-end-panel/battle-end-context';
import { BattleEndPanel } from '../battle-end-panel/battle-end-panel';
import { BattleFeedbackPool } from '../battle-feedbacks/view/battle-feedback-pool';
import { CharacterHudPool } from '../character-hud/view/character-hud-pool';
import { SpectatorPanel } from '../spectator-panel/spectator-panel';
import { CharacterListPanelConnected } from './character-list-panel-connected';
import { SpellButtonPanelConnected } from './spell-button-panel-connected';
import { TimeGaugePanelConnected } from './time-gauge-panel-connected';

type StyleProps = { isSpectator: boolean };

const useStyles = makeStyles(({ breakpoints, spacing }) => ({
    characterList: {
        position: 'absolute',
        top: 20,
        left: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'flex-end',
        padding: spacing(1),
        pointerEvents: 'none'
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
    timeGauge: ({ isSpectator }: StyleProps) => ({
        position: 'absolute',
        top: 28,
        left: '50%',
        transform: 'translateX(-50%)',
        margin: spacing(1, 0),
        width: isSpectator ? undefined : '30%',
        pointerEvents: 'none'
    }),
    chatPanel: ({ isSpectator }: StyleProps) => ({
        position: 'absolute',
        top: 28,
        right: 0,
        bottom: isSpectator ? 0 : 168 + spacing(1),
        margin: spacing(1),
        width: 150,
        pointerEvents: 'none',
        [ breakpoints.up('md') ]: {
            bottom: 0
        }
    }),
    announcementList: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none'
    }
}));

export const BattleHud: React.FC = () => {
    const isSpectator = useIsSpectator();
    const classes = useStyles({ isSpectator });

    return <>
        <CharacterHudPool />
        <BattleFeedbackPool />

        <div className={classes.characterList}>
            <CharacterListPanelConnected />
        </div>

        {!isSpectator && <div className={classes.spellButton}>
            <SpellButtonPanelConnected />
        </div>}

        <div className={classes.timeGauge}>
            {isSpectator
                ? <SpectatorPanel />
                : <TimeGaugePanelConnected />}
        </div>

        <div className={classes.chatPanel}>
            <ChatPanel onlyInputTouchable />
        </div>

        <div className={classes.announcementList}>
            <BattleAnnouncementList />
        </div>

        <BattleHeader />

        <BattleEndContextProvider>
            <BattleEndPanel />
        </BattleEndContextProvider>
    </>;
};
