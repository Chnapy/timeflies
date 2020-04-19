import { StaticCharacter } from "@timeflies/shared";
import { PlayerData } from "./PlayerData";
import { WSSocket } from "./transport/ws/WSSocket";
import { Util } from "./Util";
import { seedStaticCharacter } from "./battle/run/entities/seedStaticCharacter";

export class PlayerService {

    getPlayer(socket: WSSocket, index: number): PlayerData {

        // fetch...

        const id = Util.getUnique();

        return {
            id,
            name: 'P-' + id,
            state: 'init',
            socket,
            staticCharacters: this.getCharacters(index).map(c => {
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

    private getCharacters(index: number): StaticCharacter[] {

        if (index % 2) {
            return [MOCK_CHAR[0], MOCK_CHAR[1]];
        } else {
            return [MOCK_CHAR[2]];
        }
    }
}

const MOCK_CHAR: StaticCharacter[] = seedStaticCharacter();
