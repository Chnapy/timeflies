import { BattleDataPeriod } from '../../BattleData';
import { StageCreator, StageParam } from '../StageManager';
import { BattleSceneData } from "./BattleScene";
import { BStateMachine } from "./battleState/BStateMachine";
import { CycleManager } from './cycle/CycleManager';
import { Team } from './entities/Team';
import { MapManager } from "./map/MapManager";
import { SnapshotManager } from './snapshot/SnapshotManager';
import { SpellActionManager } from './spellAction/SpellActionManager';

export type BattleStageParam = StageParam<'battle', BattleSceneData>;

export const BattleStage: StageCreator<'battle', 'map'> = ({ mapInfos, globalTurnState, battleData, battleSnapshot }) => {

    const fillBattleData = (period: BattleDataPeriod): void => {
        const current = battleData[ period ];
        current.battleHash = battleSnapshot.battleHash;
        current.teams.push(...battleSnapshot.teamsSnapshots.map(Team));
        current.players.push(...current.teams.flatMap(t => t.players));
        current.characters.push(...current.players.flatMap(p => p.characters));
    };

    new Array<BattleDataPeriod>('current', 'future').forEach(fillBattleData);

    return {
        preload() {
            return {
                map: 'map'
            };
        },

        async create({ map }) {
            const snapshotManager = SnapshotManager();

            const spellActionManager = SpellActionManager();

            const mapManager = MapManager(
                map,
                mapInfos
            );

            const bStateMachine = BStateMachine(mapManager);

            const cycleManager = CycleManager();

            cycleManager.start(globalTurnState);

            return {
                mapManager
            };
        }
    };
};
