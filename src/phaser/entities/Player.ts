import { Character } from './Character';

export class Player {

    readonly name: string;
    readonly characters: Character[];

    constructor(
        name: string,
        characters: Character[]
    ) {
        this.name = name;
        this.characters = characters;
    }

}