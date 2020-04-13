import { StaticCharacter } from "@timeflies/shared";
import { PlayerData } from "./Player";
import { WSSocket } from "./transport/ws/WSSocket";
import { Util } from "./Util";
import { seedStaticCharacter } from "./battle/run/entities/seedStaticCharacter";

export class PlayerService {

    getPlayer(socket: WSSocket): PlayerData {

        // fetch...

        const id = Util.getUnique();

        return {
            id,
            name: 'P-' + id,
            state: 'init',
            socket,
            staticCharacters: this.getCharacters(id).map(c => {
                const charId = Util.getUnique();
                return {
                    ...c,
                    // mock
                    id: charId,
                    name: c.name + '-' + charId
                };
            })
        };
    }

    private getCharacters(playerId: string): StaticCharacter[] {

        if (!i) {
            return [MOCK_CHAR[0], MOCK_CHAR[1]];
        } else {
            return [MOCK_CHAR[2]];
        }
    }
}

let i = 0;
const MOCK_CHAR: StaticCharacter[] = seedStaticCharacter();
