import React from 'react';
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

    React.useEffect(() => {
        cycleEngine.start(turnStartTime);
    }, []);

    React.useEffect(() => {
        if (firstRenderRef.current) {
            return;
        }

        cycleEngine.setTurnsOrder(turnsOrder);
    }, [ turnsOrder ]);

    React.useEffect(() => {
        if (firstRenderRef.current) {
            return;
        }

        cycleEngine.setCharacterDuration(charactersDurations);
    }, [ charactersDurations ]);

    React.useEffect(() => {
        if (firstRenderRef.current || !playingCharacterId) {
            return;
        }

        const characterIndex = turnsOrder.indexOf(playingCharacterId);

        cycleEngine.startNextTurn({
            characterIndex,
            startTime: turnStartTime,
            roundIndex,
            turnIndex,
        });
    }, [ turnStartTime, playingCharacterId, roundIndex, turnIndex ]);

    React.useEffect(() => {
        firstRenderRef.current = false;
    });
};
