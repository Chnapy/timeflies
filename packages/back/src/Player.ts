import { PlayerState, StaticCharacter } from "@timeflies/shared";
import { WSSocket } from "./transport/ws/WSSocket";

export interface Player {
    id: string;
    name: string;
    state: PlayerState;
    socket: WSSocket;
    staticCharacters: StaticCharacter[];
}
