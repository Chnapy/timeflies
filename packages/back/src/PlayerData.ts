import { WSSocketPool } from "./transport/ws/WSSocket";

export type PlayerData = {
    id: string;
    name: string;
    socket: WSSocketPool;
};
