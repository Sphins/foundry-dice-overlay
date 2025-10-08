import { registerModuleSettings } from "./settings.js";
import { RollListener } from "./roll-listener.js";
import { OverlaySettingsForm } from "./config-app.js";
import { OverlaySocket } from "./overlay-socket.js";

const MODULE_ID = "foundry-dice-overlay";

Hooks.once("init", () => {
    console.log(`🟡 [${MODULE_ID}] Initialisation du module...`);
    registerModuleSettings();
});

// ⛔️ SUPPRIMER tout hook "setup" qui cherche Express.
// Il ne doit plus rester de code qui tente d’appeler OverlaySocket.init(app).

Hooks.once("ready", () => {
    OverlaySocket.init(); // ✅ initialisation client (BC + storage)
    console.log(`🟢 [${MODULE_ID}] Module prêt.`);
    RollListener.init();

    game.settings.registerMenu(MODULE_ID, "overlay-config-menu", {
        name: game.i18n.localize("MODULE.OVERLAY.MenuName"),
        label: game.i18n.localize("MODULE.OVERLAY.MenuLabel"),
        icon: "fas fa-tv",
        type: OverlaySettingsForm,
        restricted: true
    });
});
