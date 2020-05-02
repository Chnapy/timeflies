import { StaticCharacter } from "@timeflies/shared";
import { WSSocket } from "./transport/ws/WSSocket";

export interface PlayerData {
    id: string;
    name: string;
    socket: WSSocket;
    staticCharacters: StaticCharacter[];
}
