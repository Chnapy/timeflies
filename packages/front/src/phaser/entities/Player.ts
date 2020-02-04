import { BattleScene } from '../scenes/BattleScene';
import { Character } from './Character';
import { Team } from "./Team";
import { WithSnapshot } from './WithSnapshot';
import { PlayerSnapshot, PlayerState } from '@timeflies/shared'
import { playerInfos } from '../scenes/BootScene';

export class Player implements WithSnapshot<PlayerSnapshot> {

    readonly id: string;
    readonly itsMe: boolean;
    readonly name: string;
    state: PlayerState;
    readonly team: Team;
    readonly characters: Character[];

    constructor({
        id,
        name,
        state,
        charactersSnapshots
    }: PlayerSnapshot, team: Team, scene: BattleScene) {
        this.id = id;
        this.itsMe = id === playerInfos.id; // TODO
        this.name = name;
        this.state = state;
        this.team = team;
        this.characters = charactersSnapshots.map(snap => new Character(snap, this, team, scene));
    }

    getSnapshot(): PlayerSnapshot {
        return {
            id: this.id,
            name: this.name,
            state: this.state,
            charactersSnapshots: this.characters.map(c => c.getSnapshot())
        };
    }

    updateFromSnapshot(snapshot: PlayerSnapshot): void {
        snapshot.charactersSnapshots.forEach(cSnap => {
            const character = this.characters.find(c => c.id === cSnap.staticData.id);

            character!.updateFromSnapshot(cSnap);
        });
    }
}
