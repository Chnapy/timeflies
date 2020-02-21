import { useSelector as serviceSelector } from "react-redux";
import { UIState } from "../ui/UIState";
import { CurrentPlayer } from "../CurrentPlayer";

export const serviceCurrentPlayer = () => serviceSelector<UIState<any>, CurrentPlayer | undefined>(s => s.currentPlayer);