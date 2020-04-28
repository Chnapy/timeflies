import { BattleSnapshot, BRunEndSAction, GlobalTurnSnapshot, MapConfig } from '@timeflies/shared';
import { BattleDataMap, BattleDataPeriod } from '../../BattleData';
import { Controller } from '../../Controller';
import { serviceEvent } from '../../services/serviceEvent';
import { StageCreator, StageParam } from '../StageManager';
import { BStateMachine } from "./battleState/BStateMachine";
import { CycleManager } from './cycle/CycleManager';
import { Character } from './entities/character/Character';
import { Player } from './entities/player/Player';
import { Team } from './entities/team/Team';
import { MapManager } from "./map/MapManager";
import { SnapshotManager } from './snapshot/SnapshotManager';
import { SpellActionManager } from './spellAction/SpellActionManager';

export interface BattleSceneData {
    mapConfig: MapConfig;
    battleSnapshot: BattleSnapshot;
    battleData: BattleDataMap;
    globalTurnState: GlobalTurnSnapshot;
}

export type BattleStageParam = StageParam<'battle', BattleSceneData>;

export const BattleStage: StageCreator<'battle', 'map' | 'characters'> = ({ mapConfig, globalTurnState, battleData, battleSnapshot }) => {

    const fillBattleData = (period: BattleDataPeriod): void => {
        const data = battleData[ period ];
        data.battleHash = battleSnapshot.battleHash;

        const teams: Team<BattleDataPeriod>[] = data.teams;
        teams.push(...battleSnapshot.teamsSnapshots.map(snap => Team(period, snap)));

        const players: Player<BattleDataPeriod>[] = data.players;
        players.push(...teams.flatMap(t => t.players));

        const characters: Character<BattleDataPeriod>[] = data.characters;
        characters.push(...players.flatMap(p => p.characters));
    };

    new Array<BattleDataPeriod>('current', 'future').forEach(fillBattleData);

    return {
        preload() {
            return Controller.loader.newInstance()
                .use('map')
                .use('characters')
                .load();
        },

        async create({ map, characters: charactersSheet }, setupStageGraphic) {

            Controller.actionManager.beginBattleSession();

            const { onMessageAction } = serviceEvent();

            SnapshotManager();

            SpellActionManager();

            const mapManager = MapManager(map);

            BStateMachine(mapManager);

            const cycleManager = CycleManager();

            onMessageAction<BRunEndSAction>('battle-run/end', ({
                winnerTeamId
            }) => {
                Controller.actionManager.endBattleSession();

                alert(`Battle ended. Team ${winnerTeamId} wins !`);
            });

            setupStageGraphic({
                mapManager,
                spritesheets: {
                    characters: charactersSheet
                }
            });

            cycleManager.start(globalTurnState);
        }
    };
};
