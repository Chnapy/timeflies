import { BattleScene } from '../scenes/BattleScene';
import { Character, CharacterSnapshot } from './Character';
import { Team } from "./Team";
import { WithSnapshot } from './WithSnapshot';

export interface PlayerSnapshot {
    id: number;
    itsMe: boolean;
    name: string;
    charactersSnapshots: CharacterSnapshot[];
}

export class Player implements WithSnapshot<PlayerSnapshot> {

    readonly id: number;
    readonly itsMe: boolean;
    readonly name: string;
    readonly team: Team;
    readonly characters: Character[];

    constructor({
        id,
        itsMe,
        name,
        charactersSnapshots
    }: PlayerSnapshot, team: Team, scene: BattleScene) {
        this.id = id;
        this.itsMe = itsMe;
        this.name = name;
        this.team = team;
        this.characters = charactersSnapshots.map(snap => new Character(snap, this, team, scene));
    }

    getSnapshot(): PlayerSnapshot {
        return {
            id: this.id,
            itsMe: this.itsMe,
            name: this.name,
            charactersSnapshots: this.characters.map(c => c.getSnapshot())
        };
    }

    updateFromSnapshot(snapshot: PlayerSnapshot): void {
        snapshot.charactersSnapshots.forEach(cSnap => {
            const character = this.characters.find(c => c.id === cSnap.id);

            character!.updateFromSnapshot(cSnap);
        });
    }
}
