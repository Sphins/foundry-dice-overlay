// scripts/config-app.js
const MODULE_ID = "foundry-dice-overlay";

// Choisit V2 si dispo, sinon retombe sur V1 (pas d'avertissement en v13+).
const FormV2 = foundry?.applications?.api?.FormApplicationV2;
const BaseForm = FormV2 ?? FormApplication;

export class OverlaySettingsForm extends BaseForm {
    constructor(...args) {
        super(...args);
        // mémorise le handler pour pouvoir le nettoyer au close (V1 & V2)
        this._onResizeHandler = null;
    }

    // ---------- OPTIONS ----------
    static get defaultOptions() {
        // Fallback V1 : ancien comportement (sans casser d’anciennes versions)
        if (!FormV2) {
            return foundry.utils.mergeObject(super.defaultOptions, {
                id: "fdo-overlay-settings",
                title: game.i18n.localize("MODULE.OVERLAY.Title"),
                template: "modules/foundry-dice-overlay/templates/overlay-settings-form.hbs",
                width: Math.min(window.innerWidth - 160, 1280),
                height: "auto",
                closeOnSubmit: true,
                submitOnChange: false,
                classes: ["fdo", "overlay-settings"]
            });
        }
        // V2 : utilise DEFAULT_OPTIONS + PARTS (ci-dessous)
        return super.defaultOptions;
    }

    // Options V2
    static DEFAULT_OPTIONS = FormV2 ? {
        id: "fdo-overlay-settings",
        classes: ["fdo", "overlay-settings"],
        window: { title: game.i18n.localize("MODULE.OVERLAY.Title"), icon: "fas fa-tv" },
        position: { width: 900, height: "auto" },
        form: { submitOnChange: false, closeOnSubmit: true }
    } : undefined;

    static PARTS = FormV2 ? {
        body: { template: "modules/foundry-dice-overlay/templates/overlay-settings-form.hbs" }
    } : undefined;

    // ---------- CONTEXTE ----------
    async getData() {                // Appelé en V1
        return this.#buildContext();
    }
    async _prepareContext() {        // Appelé en V2
        return this.#buildContext();
    }
    #buildContext() {
        const get = (k) => game.settings.get(MODULE_ID, k);

        const systemChoices = {
            dnd5e: "Dungeons & Dragons Fifth Edition",
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
                systemUsed: get("systemUsed"),
                hubUrl: get("hubUrl") ?? ""      // <- pour le champ Hub
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
            docs: this._getAvailableKeys(get("systemUsed")),
            overlayUrl: this.buildOverlayUrl()
        };
    }

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

    // ---------- SAUVEGARDE ----------
    async _updateObject(event, formData) {     // V1
        if (!FormV2) await this.#save(formData);
    }
    async _onSubmit(event, { formData } = {}) { // V2
        if (FormV2) await this.#save(formData);
    }
    async #save(formData) {
        const data = foundry.utils.expandObject(formData);
        await Promise.all(Object.entries(data).map(([k, v]) => game.settings.set(MODULE_ID, k, v)));
        try { (await import("./overlay-socket.js")).OverlaySocket.pushConfig(); } catch { }
        console.log("[foundry-dice-overlay] settings saved", data);
    }

    // ---------- LISTENERS ----------
    activateListeners(html) {
        super.activateListeners?.(html);
        const $html = $(html);
        const $toggle = $html.find('input[name="enableJs"]');
        const $jsBlock = $html.find('[data-js-block]');

        const refresh = () => $jsBlock.toggleClass('is-hidden', !$toggle.prop('checked'));
        $toggle.on('change', refresh);
        refresh();

        $html.find('[data-action="copy-url"]').on('click', async () => {
            const url = this.buildOverlayUrl();
            try { await navigator.clipboard.writeText(url); } catch { /* ignore */ }
            ui.notifications?.info(game.i18n.localize("MODULE.OVERLAY.Copied"));
        });
        $html.find('[data-action="open-url"]').on('click', () => {
            window.open(this.buildOverlayUrl(), "_blank", "noopener");
        });

        // -- GESTION DU REDIMENSIONNEMENT (sans this.once)
        if (!this._onResizeHandler) {
            this._onResizeHandler = () => {
                const w = Math.min(window.innerWidth - 160, 1280);
                this.setPosition?.({ width: w, height: "auto" });
            };
            window.addEventListener("resize", this._onResizeHandler);
        }
    }

    // Nettoyage propre en fermeture (V1 et V2)
    async close(options) {
        if (this._onResizeHandler) {
            window.removeEventListener("resize", this._onResizeHandler);
            this._onResizeHandler = null;
        }
        return super.close(options);
    }

    // ---------- URL overlay ----------
    buildOverlayUrl() {
        const origin = window.location.origin;
        const world = game.world?.id || "unknown-world";
        const channel = `${MODULE_ID}:${world}`;

        const params = new URLSearchParams({ channel, world });

        // Ajoute automatiquement le hub s’il est configuré
        const hub = game.settings.get(MODULE_ID, "hubUrl") ?? "";
        if (hub) params.set("hub", hub);

        return `${origin}/modules/${MODULE_ID}/public/overlay.html?${params.toString()}`;
    }
}
