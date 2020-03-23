import { CurrentPlayer } from "../CurrentPlayer";
import { serviceSelector } from './serviceSelector';

export const serviceCurrentPlayer = () => serviceSelector<CurrentPlayer | null>(s => s.currentPlayer);