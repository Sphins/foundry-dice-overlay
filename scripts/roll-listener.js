import { RollFormatter } from "./roll-formatter.js";

export class RollListener {
    static init() {
        console.log("🎲 [foundry-dice-overlay] RollListener actif");

        Hooks.on("createChatMessage", async (message) => {
            if (!message.isRoll || message.author?.isGM) return;

            const data = RollFormatter.extractData(message);
            if (!data) return;

            console.log("📤 Données envoyées à l’overlay :", data);
        });
    }
}
