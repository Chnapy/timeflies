import { ConfirmSAction, NotifySAction, SpellActionCAction } from '@timeflies/shared';
import { BattleStateManager } from '../battleStateManager/BattleStateManager';
import { Cycle } from '../cycle/Cycle';
import { Character, characterToSnapshot } from '../entities/character/Character';
import { Player, playerToSnapshot } from '../entities/player/Player';
import { MapManager } from '../mapManager/MapManager';
import { SpellActionChecker } from '../spellActionChecker/SpellActionChecker';
import { teamToSnapshot } from '../entities/team/Team';
import { spellToSnapshot } from '../entities/spell/Spell';

export interface SpellActionReceiver {
    getOnReceive(player: Player): (action: SpellActionCAction) => void;
}

interface Props {
    stateManager: BattleStateManager;
    cycle: Cycle;
    mapManager: MapManager;
    checkDeathsAndDisconnects: () => void;
}

interface Dependencies {
    spellActionCheckerCreator: typeof SpellActionChecker;
}

export const SpellActionReceiver = (
    { stateManager, cycle, mapManager, checkDeathsAndDisconnects }: Props,
    { spellActionCheckerCreator }: Dependencies = {
        spellActionCheckerCreator: SpellActionChecker
    }
): SpellActionReceiver => {

    const { get } = stateManager;

    const spellActionChecker = spellActionCheckerCreator(cycle, mapManager);

    const notifyDeaths = (deaths: Character[]): void => {
        if (!deaths.length) {
            return;
        }

        cycle.globalTurn.notifyDeaths();

        checkDeathsAndDisconnects();
    };

    const getOnReceive = (player: Player) => (action: SpellActionCAction): void => {

        const isCheckSuccess = spellActionChecker.check(action, player, get).success;

        const sendConfirmAction = (isOk: boolean, lastCorrectHash: string): void => {

            player.socket.send<ConfirmSAction>({
                type: 'confirm',
                isOk,
                lastCorrectHash,
                debug: isOk
                    ? undefined
                    : {
                        sendHash: action.spellAction.battleHash,
                        correctBattleSnapshot: {
                            teamsSnapshots: get('teams').map(teamToSnapshot),
                            playersSnapshots: get('players').map(playerToSnapshot),
                            charactersSnapshots: get('characters').map(characterToSnapshot),
                            spellsSnapshots: get('spells').map(spellToSnapshot)
                        }
                    }
            });
        };

        console.log('isCheckSuccess', isCheckSuccess);

        if (isCheckSuccess) {

            const applySucceed = stateManager.useSpellAction(action.spellAction)
                .onClone()
                .ifCorrectHash((hash, applyOnCurrentState) => {

                    const { deaths } = applyOnCurrentState();

                    sendConfirmAction(true, hash);

                    get('players')
                        .filter(p => p.id !== player.id)
                        .forEach(p => p.socket.send<NotifySAction>({
                            type: 'notify',
                            spellActionSnapshot: action.spellAction,
                        }));

                    notifyDeaths(deaths);
                });

            if (applySucceed) {
                return;
            }
        }

        const lastCorrectHash = get('battleHashList')[ get('battleHashList').length - 1 ];

        sendConfirmAction(false, lastCorrectHash);
    };

    return {
        getOnReceive
    };
};
