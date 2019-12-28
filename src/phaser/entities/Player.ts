import { BattleScene } from '../scenes/BattleScene';
import { Character, CharacterInfos } from './Character';
import { Team } from "./Team";
import { WithInfos } from './WithInfos';

export interface PlayerInfos {
    id: number;
    itsMe: boolean;
    name: string;
    charactersInfos: CharacterInfos[];
}

export class Player implements WithInfos<PlayerInfos> {

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

    getInfos(): PlayerInfos {
        return {
            id: this.id,
            itsMe: this.itsMe,
            name: this.name,
            charactersInfos: this.characters.map(c => c.getInfos())
        };
    }

    updateInfos(infos: PlayerInfos): void {
        infos.charactersInfos.forEach(cInfos => {
            const character = this.characters.find(c => c.id === cInfos.id);

            character!.updateInfos(cInfos);
        });
    }
}
