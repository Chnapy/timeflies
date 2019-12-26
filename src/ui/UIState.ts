import { Character } from '../phaser/entities/Character';
import { StateMap } from '../phaser/stateManager/StateManager';

export interface UIState {

    gameState: StateMap;

    currentCharacter: Character | null;

}
