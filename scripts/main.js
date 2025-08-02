import { registerModuleSettings } from "./settings.js";
import { RollListener } from "./roll-listener.js";
import { OverlaySettingsForm } from "./config-app.js";

const MODULE_ID = "foundry-dice-overlay";

Hooks.once("init", () => {
    console.log(`🟡 [${MODULE_ID}] Initialisation du module...`);
    registerModuleSettings();

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
