import { StaticCharacter } from "@timeflies/shared";
import { PlayerRoomData } from './battle/room/room';
import { seedStaticCharacter } from "./battle/run/entities/seedStaticCharacter";
import { WSSocket } from "./transport/ws/WSSocket";
import { Util } from "./Util";

export class PlayerService {

    getPlayer(socket: WSSocket, index: number): PlayerRoomData {

        // fetch...

        const id = Util.getUnique();

        return {
            id,
            name: 'P-' + id,
            socket,
            // staticCharacters: this.getCharacters(index).map(c => {
            //     const charId = Util.getUnique();
            //     return {
            //         staticData: {
            //             ...c,
            //             // mock
            //             id: charId,
            //             name: c.name + '-' + charId
            //         }
            //     };
            // })
        };
    }

    private getCharacters(index: number): StaticCharacter[] {

        if (index % 2) {
            return [ MOCK_CHAR[ 0 ], MOCK_CHAR[ 1 ] ];
        } else {
            return [ MOCK_CHAR[ 2 ] ];
        }
    }
}

const MOCK_CHAR: StaticCharacter[] = seedStaticCharacter();
