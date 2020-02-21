import { BattleScene } from "./BattleScene";
import { Pathfinder } from "./map/Pathfinder";
import { MapGraphics } from "./graphics/MapGraphics";
import { MapManager } from "./map/MapManager";
import { BStateMachine } from "./battleState/BStateMachine";
import { CameraManager } from "./camera/CameraManager";

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
            const { battleData, mapInfos } = scene.initData;

            const mapManager = MapManager({
                battleData,
                getPathfinder: Pathfinder,
                getGraphics: () => MapGraphics(mapInfos, { scene })
            });

            const bStateMachine = BStateMachine(battleData);

            const cameraManager = new CameraManager(scene);

        }
    };
};
