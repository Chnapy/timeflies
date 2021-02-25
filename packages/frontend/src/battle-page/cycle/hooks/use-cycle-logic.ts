import React from 'react';
import { useAsyncEffect } from 'use-async-effect';
import { useCurrentEntities } from '../../hooks/use-entities';
import { useBattleSelector } from '../../store/hooks/use-battle-selector';
import { useCycleEngine } from '../view/cycle-engine-context';

export const useCycleLogic = () => {
    const turnsOrder = useBattleSelector(battle => battle.turnsOrder);
    const charactersDurations = useCurrentEntities(({ characters }) => characters.actionTime);
    const turnStartTime = useBattleSelector(battle => battle.turnStartTime);
    const playingCharacterId = useBattleSelector(battle => battle.playingCharacterId);
    const roundIndex = useBattleSelector(battle => battle.roundIndex);
    const turnIndex = useBattleSelector(battle => battle.turnIndex);

    const firstRenderRef = React.useRef(true);

    const cycleEngine = useCycleEngine();

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
        if (!playingCharacterId) {
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
