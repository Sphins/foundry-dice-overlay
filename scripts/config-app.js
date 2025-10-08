// scripts/config-app.js
const MODULE_ID = "foundry-dice-overlay";

/**
 * Formulaire de configuration de l’overlay (Foundry v13).
 * - Labels au-dessus des champs
 * - <select> pour le système
 * - Masquage du bloc JS quand "enableJs" est décoché
 */
export class OverlaySettingsForm extends FormApplication {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: "fdo-overlay-settings",
            title: game.i18n.localize("MODULE.OVERLAY.Title"),
            template: "modules/foundry-dice-overlay/templates/overlay-settings-form.hbs",
            width: 900,
            height: "auto",
            closeOnSubmit: true,
            submitOnChange: false,
            classes: ["fdo", "overlay-settings"]
        });
    }

    getData() {
        const get = (k) => game.settings.get(MODULE_ID, k);

        // Choix de systèmes (extensible)
        const systemChoices = {
            dnd5e: "D&D 5e",
            knight: "Knight",
            [game.system.id]: game.system.title ?? game.system.id
        };

        return {
            values: {
                customHtml: get("customHtml"),
                customCss: get("customCss"),
                enableJs: get("enableJs"),
                customJs: get("customJs"),
                displayDuration: get("displayDuration"),
                displayMode: get("displayMode"),
                filterGmRolls: get("filterGmRolls"),
                systemUsed: get("systemUsed")
            },
            choices: {
                displayMode: {
                    single: game.i18n.localize("MODULE.OVERLAY.DisplayMode.single"),
                    stack: game.i18n.localize("MODULE.OVERLAY.DisplayMode.stack")
                },
                filterGmRolls: {
                    showAll: game.i18n.localize("MODULE.OVERLAY.Filter.showAll"),
                    hideGm: game.i18n.localize("MODULE.OVERLAY.Filter.hideGm")
                },
                system: systemChoices
            },
            flags: {
                showJs: get("enableJs")
            },
            docs: this._getAvailableKeys(get("systemUsed"))
        };
    }

    /**
     * Clés de données “documentées” pour aider l’utilisateur.
     * (Tu pourras remplacer par un template par système si besoin.)
     */
    _getAvailableKeys(systemId) {
        const base = [
            { id: "actor", label: game.i18n.localize("MODULE.OVERLAY.Doc.actor") },
            { id: "formula", label: game.i18n.localize("MODULE.OVERLAY.Doc.formula") },
            { id: "total", label: game.i18n.localize("MODULE.OVERLAY.Doc.total") },
            { id: "flavor", label: game.i18n.localize("MODULE.OVERLAY.Doc.flavor") }
        ];
        if (systemId === "dnd5e") {
            base.push(
                { id: "type", label: game.i18n.localize("MODULE.OVERLAY.Doc.type") },
                { id: "ability", label: game.i18n.localize("MODULE.OVERLAY.Doc.ability") },
                { id: "skill", label: game.i18n.localize("MODULE.OVERLAY.Doc.skill") },
                { id: "isAttack", label: game.i18n.localize("MODULE.OVERLAY.Doc.isAttack") },
                { id: "isDamage", label: game.i18n.localize("MODULE.OVERLAY.Doc.isDamage") }
            );
        }
        return base;
    }

    activateListeners(html) {
        super.activateListeners(html);
        const $html = $(html);

        // Toggle bloc JS
        const $toggle = $html.find('[name="enableJs"]');
        const $jsBlock = $html.find('[data-js-block]');
        const refresh = () => $jsBlock.toggleClass("is-hidden", !$toggle.is(":checked"));
        $toggle.on("change", refresh);
        refresh();
    }

    async _updateObject(event, formData) {
        const data = foundry.utils.expandObject(formData);
        await Promise.all(
            Object.entries(data).map(([k, v]) => game.settings.set(MODULE_ID, k, v))
        );
    }
}
