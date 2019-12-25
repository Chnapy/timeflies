import { Character } from '../phaser/entities/Character';
import { Pathfinder } from '../phaser/pathfinder/Pathfinder';

export interface UIState {

    pathfinder: Pathfinder;

    currentCharacter: Character | null;

}
