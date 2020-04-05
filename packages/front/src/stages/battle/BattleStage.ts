import { BattleDataPeriod } from '../../BattleData';
import { StageCreator, StageParam } from '../StageManager';
import { BattleSceneData } from "./BattleScene";
import { BStateMachine } from "./battleState/BStateMachine";
import { CycleManager } from './cycle/CycleManager';
import { Team } from './entities/team/Team';
import { MapManager } from "./map/MapManager";
import { SnapshotManager } from './snapshot/SnapshotManager';
import { SpellActionManager } from './spellAction/SpellActionManager';
import { Controller } from '../../Controller';

export type BattleStageParam = StageParam<'battle', BattleSceneData>;

export const BattleStage: StageCreator<'battle', 'map' | 'characters'> = ({ mapInfos, globalTurnState, battleData, battleSnapshot }) => {

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
            return Controller.loader.newInstance()
                .use('map')
                .use('characters')
                .load();
        },

        async create({ map, characters: charactersSheet }, setupStageGraphic) {
            const snapshotManager = SnapshotManager();

            const spellActionManager = SpellActionManager();

            const mapManager = MapManager(
                map,
                mapInfos
            );

            const bStateMachine = BStateMachine(mapManager);

            const cycleManager = CycleManager();

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
