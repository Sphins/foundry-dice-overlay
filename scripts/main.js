import { registerModuleSettings } from "./settings.js";
import { RollListener } from "./roll-listener.js";

const MODULE_ID = "foundry-dice-overlay";

Hooks.once("init", () => {
    console.log(`🟡 [${MODULE_ID}] Initialisation du module...`);
    registerModuleSettings();
});

Hooks.once("ready", () => {
    console.log(`🟢 [${MODULE_ID}] Module prêt.`);
    RollListener.init();
});
