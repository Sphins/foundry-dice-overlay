// scripts/overlay-socket.js
const MODULE_ID = "foundry-dice-overlay";

/**
 * Diffusion côté client via BroadcastChannel, fallback localStorage.
 * Pas d'Express, pas de serveur custom : fonctionne sur Molten & OBS.
 */
export class OverlaySocket {
    static channelName = MODULE_ID;   // tu pourras en faire un setting si tu veux
    static bc = null;

    static init() {
        // Essaie d'ouvrir un BroadcastChannel
        try {
            this.bc = new BroadcastChannel(this.channelName);
            console.log(`[${MODULE_ID}] BroadcastChannel prêt : ${this.channelName}`);
        } catch (e) {
            this.bc = null;
            console.warn(`[${MODULE_ID}] BroadcastChannel indisponible, fallback localStorage.`);
        }
    }

    static send(data) {
        const json = JSON.stringify(data);

        // 1) BroadcastChannel si dispo
        if (this.bc) {
            try { this.bc.postMessage(json); } catch (_) { }
        }

        // 2) Fallback via storage event (déclenché dans les AUTRES fenêtres)
        try {
            // ajoute un timestamp pour garantir le déclenchement
            localStorage.setItem(`${MODULE_ID}:last`, `${Date.now()}|${json}`);
        } catch (_) { }
    }
}
