import { RollFormatter } from "./roll-formatter.js";
import { OverlaySocket } from "./overlay-socket.js";

export class RollListener {
    static init() {
        console.log("🎲 [foundry-dice-overlay] RollListener actif");

        Hooks.on("createChatMessage", async (message) => {
            if (!message.isRoll) return;
            const filter = game.settings.get("foundry-dice-overlay", "filterGmRolls");
            if (filter === "hideGm" && message.author?.isGM) return;

            const data = RollFormatter.extractData(message);
            if (!data) return;
            OverlaySocket.send(data);
            console.log("📤 Données envoyées à l’overlay :", data);
        });
    }
}
