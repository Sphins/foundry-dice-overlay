import { RollFormatter } from "./roll-formatter.js";

const MODULE_ID = "foundry-dice-overlay";

export class OverlaySettingsForm extends FormApplication {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "overlay-settings-form",
            title: "Foundry Dice Overlay - Paramètres",
            template: `modules/${MODULE_ID}/templates/overlay-settings-form.hbs`,
            width: 800,
            height: "auto",
            closeOnSubmit: true
        });
    }

    getData() {
        const systemId = game.settings.get(MODULE_ID, "systemUsed");
        const formatter = RollFormatter.getFormatterForSystem(systemId);
        const availableKeys = formatter?.getOverlayKeys?.() ?? [];

        return {
            html: game.settings.get(MODULE_ID, "customHtml"),
            css: game.settings.get(MODULE_ID, "customCss"),
            js: game.settings.get(MODULE_ID, "customJs"),
            enableJs: game.settings.get(MODULE_ID, "enableJs"),
            duration: game.settings.get(MODULE_ID, "displayDuration"),
            mode: game.settings.get(MODULE_ID, "displayMode"),
            filter: game.settings.get(MODULE_ID, "filterGmRolls"),
            system: systemId,
            systems: RollFormatter.getSupportedSystems(),
            availableKeys // ← Ajout de la liste des données exposées
        };
    }


    async _updateObject(_event, formData) {
        await game.settings.set("foundry-dice-overlay", "customHtml", formData.html);
        await game.settings.set("foundry-dice-overlay", "customCss", formData.css);
        await game.settings.set("foundry-dice-overlay", "customJs", formData.js);
        await game.settings.set("foundry-dice-overlay", "enableJs", formData.enableJs);
        await game.settings.set("foundry-dice-overlay", "displayDuration", Number(formData.duration));
        await game.settings.set("foundry-dice-overlay", "displayMode", formData.mode);
        await game.settings.set("foundry-dice-overlay", "filterGmRolls", formData.filter);
        await game.settings.set("foundry-dice-overlay", "systemUsed", formData.system);
    }

    activateListeners(html) {
        super.activateListeners(html);

        const form = html[0]; // html est un jQuery-like, on récupère l’élément DOM natif
        const checkbox = form.querySelector('input[name="enableJs"]');
        const jsGroup = form.querySelector('#js-group');

        if (!checkbox || !jsGroup) return;

        const toggle = () => {
            jsGroup.style.display = checkbox.checked ? "block" : "none";
        };

        checkbox.addEventListener("change", toggle);
        toggle(); // initialise à l'ouverture
    }
}
