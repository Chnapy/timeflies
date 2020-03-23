import { StageCreator, StageParam } from '../StageManager';
import { BattleSceneData } from "./BattleScene";
import { BStateMachine } from "./battleState/BStateMachine";
import { CycleManager } from './cycle/CycleManager';
import { BattleStageGraphic } from './graphic/BattleStageGraphic';
import { MapManager } from "./map/MapManager";
import { SnapshotManager } from './snapshot/SnapshotManager';
import { SpellActionManager } from './spellAction/SpellActionManager';

export type BattleStageParam = StageParam<'battle', BattleSceneData>;

export const BattleStage: StageCreator<'battle', 'mapSchema'> = ({ mapInfos, globalTurnState }) => {
 
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
