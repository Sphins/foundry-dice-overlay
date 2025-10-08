import { registerModuleSettings } from "./settings.js";
import { RollListener } from "./roll-listener.js";
import { OverlaySettingsForm } from "./config-app.js";
import { OverlaySocket } from "./overlay-socket.js";

const MODULE_ID = "foundry-dice-overlay";

Hooks.once("init", () => {
    console.log(`🟡 [${MODULE_ID}] Initialisation du module...`);
    try { registerModuleSettings(); } catch (e) { console.error('[foundry-dice-overlay] settings init error', e); }

});

Hooks.once("setup", () => {
    const app = globalThis.foundry?.server?.express;
    if (app) {
        OverlaySocket.init(app);
        console.log("🟢 OverlaySocket initialisé via Express.");
    } else {
        console.warn("🔴 OverlaySocket non initialisé : Express introuvable.");
    }
});


Hooks.once("ready", () => {
    console.log(`🟢 [${MODULE_ID}] Module prêt.`);
    RollListener.init();
    game.settings.registerMenu("foundry-dice-overlay", "overlay-config-menu", {
        name: game.i18n.localize("MODULE.OVERLAY.MenuName"),
        label: game.i18n.localize("MODULE.OVERLAY.MenuLabel"),
        icon: "fas fa-tv",
        type: OverlaySettingsForm, // ta classe qui hérite de FormApplication
        restricted: true
    });
});
