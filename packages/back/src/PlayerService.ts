import { StaticCharacter } from "@timeflies/shared";
import { Player } from "./Player";
import { WSSocket } from "./transport/ws/WSSocket";
import { Util } from "./Util";
import { seedStaticCharacter } from "./__seeds__/seedStaticCharacter";

export class PlayerService {

    getPlayer(socket: WSSocket): Player {

        // fetch...

        const id = Util.getUnique();

        return {
            id,
            name: 'P-' + id,
            state: 'init',
            socket,
            staticCharacters: this.getCharacters(id).map(c => ({
                ...c,
                // mock
                id: Util.getUnique()
            }))
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
