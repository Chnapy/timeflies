import { TeamRoom, TeamSnapshot } from "@timeflies/shared";

export type Team = {
    id: string;
    letter: string;
};

export const teamToSnapshot = ({ id, letter }: Team): TeamSnapshot => ({
    id,
    letter
});

export const Team = ({ id, letter }: Pick<TeamRoom, 'id' | 'letter'>) => {

    return {
        id,
        letter
    };

    // const this_: Team = {
    //     id: teamData.id,
    //     letter: teamData.letter,
    //     get players() {
    //         return players;
    //     },
    //     get characters() {
    //         return characters;
    //     },
    //     toSnapshot(): TeamSnapshot {
    //         return {
    //             id: this_.id,
    //             letter: this_.letter,
    //             playersSnapshots: players.map(p => p.toSnapshot())
    //         };
    //     },
    //     updateFromSnapshot(snapshot) {
    //         players.forEach(player => player.updateFromSnapshot(
    //             snapshot.playersSnapshots.find(snap => snap.id === player.id)!
    //         ));
    //     },
    //     clone() {
    //         const team = Team(teamData, deps);
    //         team.updateFromSnapshot(this_.toSnapshot());
    //         return team;
    //     }
    // };

    // const players = teamData.players.map(p => playerCreator(p, this_));
    // const characters = players.flatMap(p => p.characters);

    // return this_;
};
