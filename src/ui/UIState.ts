import { Character } from '../phaser/entities/Character';
import { BattleStateMap } from '../phaser/stateManager/BattleStateManager';

export interface UIState {

    gameState: BattleStateMap;

    currentCharacter: Character | null;

}
