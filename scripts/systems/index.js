import { Dnd5eRollFormatter } from "./dnd5e-formatter.js";
import { KnightRollFormatter } from "./knight-formatter.js";

export function getSystemFormatters() {
    return [Dnd5eRollFormatter, KnightRollFormatter];
}
