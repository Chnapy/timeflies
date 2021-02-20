import React from 'react';
import { useAsyncEffect } from 'use-async-effect';
import { useBattleSelector } from '../../store/hooks/use-battle-selector';
import { useCycleEngine } from '../view/cycle-engine-context';

export const useCycleLogic = () => {
    const turnsOrder = useBattleSelector(battle => battle.turnsOrder);
    const charactersDurations = useBattleSelector(battle => battle.currentCharacters.actionTime);
    const turnStartTime = useBattleSelector(battle => battle.turnStartTime);
    const playingCharacterId = useBattleSelector(battle => battle.playingCharacterId);
    const roundIndex = useBattleSelector(battle => battle.roundIndex);
    const turnIndex = useBattleSelector(battle => battle.turnIndex);

    const firstRenderRef = React.useRef(true);

    const cycleEngine = useCycleEngine();

    useAsyncEffect(async () => {
        if (!cycleEngine.isStarted()) {
            await cycleEngine.start(turnStartTime);
        }
    }, [ cycleEngine, turnStartTime ]);

    React.useEffect(() => {
        if (firstRenderRef.current) {
            return;
        }

        cycleEngine.setTurnsOrder(turnsOrder);
    }, [ cycleEngine, turnsOrder ]);

    React.useEffect(() => {
        if (firstRenderRef.current) {
            return;
        }

        cycleEngine.setCharacterDuration(charactersDurations);
    }, [ cycleEngine, charactersDurations ]);

    useAsyncEffect(async () => {
        if (firstRenderRef.current || !playingCharacterId) {
            return;
        }

        const characterIndex = turnsOrder.indexOf(playingCharacterId);

        await cycleEngine.startNextTurn({
            characterIndex,
            startTime: turnStartTime,
            roundIndex,
            turnIndex,
        });
    }, [ cycleEngine, turnStartTime, playingCharacterId, roundIndex, turnIndex ]);

    React.useEffect(() => {
        firstRenderRef.current = false;
    });
};
