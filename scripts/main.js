import { registerModuleSettings } from "./settings.js";
import { RollListener } from "./roll-listener.js";
import { OverlaySettingsForm } from "./config-app.js";
import { OverlaySocket } from "./overlay-socket.js";

const MODULE_ID = "foundry-dice-overlay";

Hooks.once("init", () => {
    registerModuleSettings();

    // (ré)enregistrer le menu ici, pas dans ready
    game.settings.registerMenu(MODULE_ID, "overlay-config-menu", {
        name: "Foundry Dice Overlay - Paramètres",
        label: "Configurer l’overlay",
        icon: "fas fa-tv",
        type: OverlaySettingsForm,   // <-- doit pointer vers une classe exportée
        restricted: true
    });
});

// ⛔️ SUPPRIMER tout hook "setup" qui cherche Express.
// Il ne doit plus rester de code qui tente d’appeler OverlaySocket.init(app).

Hooks.once("ready", () => {
    console.log(`🟢 [${MODULE_ID}] Module prêt.`);
    // Initialise le canal de diffusion (BroadcastChannel / localStorage)
    OverlaySocket.init();
    // Active l’écoute des jets
    RollListener.init();

    // Canal = module + id du monde
    const channel = `${MODULE_ID}:${game.world?.id || "default"}`;

    // 1) setting Foundry
    let hub = game.settings.get(MODULE_ID, "hubUrl") || "";

    // 2) possibilité d'override via ?hub=... dans l’URL du client (pratique en test)
    try {
        const p = new URLSearchParams(window.location.search);
        hub = p.get("hub") || hub;
    } catch (e) { }

    if (hub) {
        // branchement vers Cloudflare Worker
        OverlaySocket.connectHub(hub, channel);
    } else {
        console.warn(`[${MODULE_ID}] Aucun hub configuré (setting "hubUrl").`);
    }
});
