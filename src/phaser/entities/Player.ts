import { BattleScene } from '../scenes/BattleScene';
import { Character, CharacterInfos } from './Character';
import { Team } from './Team';

export interface PlayerInfos {
    id: number;
    itsMe: boolean;
    name: string;
    charactersInfos: CharacterInfos[];
}

export class Player {

    readonly id: number;
    readonly itsMe: boolean;
    readonly name: string;
    readonly team: Team;
    readonly characters: Character[];

    constructor({
        id,
        itsMe,
        name,
        charactersInfos
    }: PlayerInfos, team: Team, scene: BattleScene) {
        this.id = id;
        this.itsMe = itsMe;
        this.name = name;
        this.team = team;
        this.characters = charactersInfos.map(infos => new Character(infos, this, team, scene));
    }
}
