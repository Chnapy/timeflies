import { StageCreator, StageParam } from '../StageManager';
import { BattleSceneData } from "./BattleScene";
import { BStateMachine } from "./battleState/BStateMachine";
import { CycleManager } from './cycle/CycleManager';
import { BattleStageGraphic } from './graphic/BattleStageGraphic';
import { MapManager } from "./map/MapManager";
import { SnapshotManager } from './snapshot/SnapshotManager';
import { SpellActionManager } from './spellAction/SpellActionManager';
import { Team } from './entities/Team';
import { BattleDataPeriod } from '../../BattleData';

export type BattleStageParam = StageParam<'battle', BattleSceneData>;

export const BattleStage: StageCreator<'battle', 'mapSchema'> = ({ mapInfos, globalTurnState, battleData, battleSnapshot }) => {

    const fillBattleData = (period: BattleDataPeriod): void => {
        const current = battleData[ period ];
        current.battleHash = battleSnapshot.battleHash;
        current.teams.push(...battleSnapshot.teamsSnapshots.map(Team));
        current.players.push(...current.teams.flatMap(t => t.players));
        current.characters.push(...current.players.flatMap(p => p.characters));
    };

    new Array<BattleDataPeriod>('current', 'future').forEach(fillBattleData);

    const graphic = BattleStageGraphic();

    return {
        graphic,
        preload() {
            return {
                mapSchema: 'mapSchema'
            };
        },

        create({ mapSchema }) {
            const snapshotManager = SnapshotManager();

            const spellActionManager = SpellActionManager();

            const mapManager = MapManager(
                mapSchema,
                mapInfos
            );

            const bStateMachine = BStateMachine(mapManager);

            const cycleManager = CycleManager();

            cycleManager.start(globalTurnState);
        }
    };
};
