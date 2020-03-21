import { BattleScene } from "./BattleScene";
import { BStateMachine } from "./battleState/BStateMachine";
import { CameraManager } from "./camera/CameraManager";
import { CycleManager } from './cycle/CycleManager';
import { MapGraphics } from "./graphics/MapGraphics";
import { MapManager } from "./map/MapManager";
import { SnapshotManager } from './snapshot/SnapshotManager';
import { SpellActionManager } from './spellAction/SpellActionManager';

export interface BattleStage {
    onInit(): void;
    onPreload(): void;
    onCreate(): void;
}

export const BattleStage = (scene: BattleScene): BattleStage => {

    return {
        onInit() {

        },

        onPreload() {

        },

        onCreate() {
            const { mapInfos, globalTurnState } = scene.initData;

            const snapshotManager = SnapshotManager();

            const spellActionManager = SpellActionManager();

            const mapManager = MapManager(
                () => MapGraphics(mapInfos, { scene })
            );

            const bStateMachine = BStateMachine(mapManager);

            const cycleManager = CycleManager();

            const cameraManager = new CameraManager(scene);

            cycleManager.start(globalTurnState);
        }
    };
};
