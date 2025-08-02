export class OverlaySettingsForm extends FormApplication {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "overlay-settings-form",
            title: "Foundry Dice Overlay - Paramètres",
            template: "modules/foundry-dice-overlay/templates/overlay-settings-form.hbs",
            width: 800,
            height: "auto",
            closeOnSubmit: true
        });
    }

    getData() {
        return {
            html: game.settings.get("foundry-dice-overlay", "customHtml"),
            css: game.settings.get("foundry-dice-overlay", "customCss"),
            js: game.settings.get("foundry-dice-overlay", "customJs"),
            enableJs: game.settings.get("foundry-dice-overlay", "enableJs"),
            duration: game.settings.get("foundry-dice-overlay", "displayDuration"),
            mode: game.settings.get("foundry-dice-overlay", "displayMode"),
            filter: game.settings.get("foundry-dice-overlay", "filterGmRolls"),
            system: game.settings.get("foundry-dice-overlay", "systemUsed")
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
}
