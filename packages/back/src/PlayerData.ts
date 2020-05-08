import { Position, StaticCharacter } from "@timeflies/shared";
import { WSSocketPool } from "./transport/ws/WSSocket";

export interface PlayerData {
    id: string;
    name: string;
    socket: WSSocketPool;
    staticCharacters: {
        staticData: StaticCharacter;
        initialPosition: Position;
    }[];
}
