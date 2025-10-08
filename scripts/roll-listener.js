import { RollFormatter } from "./roll-formatter.js";
import { OverlaySocket } from "./overlay-socket.js";

export class RollListener {
    static init() {
        console.log("🎲 [foundry-dice-overlay] RollListener actif");

        Hooks.on("createChatMessage", async (message) => {
            if (!message.isRoll) return;

            // Filtre MJ selon le réglage
            const filter = game.settings.get("foundry-dice-overlay", "filterGmRolls");
            if (filter === "hideGm" && message.user?.isGM) return;

            // ⛔️ Anti-doublon : seul le client AUTEUR diffuse
            // (côté MJ et autres clients : on ignore)
            if (game.user?.id !== message.author?.id) return;

            const data = RollFormatter.extractData(message);
            if (!data) return;

            // Identifiant pour dédup éventuelle côté overlay (sécurité)
            data.messageId = message.id ?? message._id ?? null;

            OverlaySocket.send(data);
            console.log("📤 Données envoyées à l’overlay :", data);
        });

    }
}
