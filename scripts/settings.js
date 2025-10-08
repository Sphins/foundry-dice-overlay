export function registerModuleSettings() {
    const MODULE_ID = "foundry-dice-overlay";

    game.settings.register(MODULE_ID, "customHtml", {
        name: "Overlay HTML",
        hint: "Code HTML utilisé pour afficher chaque jet.",
        scope: "world",
        config: false,
        type: String,
        default: "",
        multiline: true,
        rows: 15
    });

    game.settings.register(MODULE_ID, "customCss", {
        name: "Overlay CSS",
        hint: "Code CSS appliqué à l'affichage des jets.",
        scope: "world",
        config: false,
        type: String,
        default: "",
        multiline: true,
        rows: 15
    });

    game.settings.register(MODULE_ID, "enableJs", {
        name: "Activer JavaScript personnalisé",
        hint: "Permet d'exécuter un script JS (ex: animation avec anime.js).",
        scope: "world",
        config: false,
        type: Boolean,
        default: false
    });

    game.settings.register(MODULE_ID, "customJs", {
        name: "Overlay JS",
        hint: "Code JavaScript exécuté dans l’overlay (si activé).",
        scope: "world",
        config: false,
        type: String,
        default: "",
        multiline: true,
        rows: 15
    });

    game.settings.register(MODULE_ID, "displayDuration", {
        name: "Durée d’affichage (sec)",
        hint: "Temps pendant lequel chaque jet reste affiché.",
        scope: "world",
        config: false,
        type: Number,
        default: 5
    });

    game.settings.register(MODULE_ID, "displayMode", {
        name: "Mode d’affichage",
        hint: "Un seul jet à la fois ou plusieurs en pile.",
        scope: "world",
        config: false,
        type: String,
        choices: {
            single: "Un à la fois",
            stack: "Pile visible"
        },
        default: "single"
    });

    game.settings.register(MODULE_ID, "filterGmRolls", {
        name: "Filtres des jets MJ",
        hint: "Afficher ou non les jets du MJ.",
        scope: "world",
        config: false,
        type: String,
        choices: {
            showAll: "Afficher tous les jets",
            hideGm: "Masquer les jets du MJ"
        },
        default: "showAll"
    });

    game.settings.register(MODULE_ID, "systemUsed", {
        name: "Système ciblé (optionnel)",
        hint: "Permet d’afficher les infos de données dans l’UI (si plusieurs systèmes).",
        scope: "world",
        config: false,
        type: String,
        default: game.system.id
    });

    console.log(`⚙️ [${MODULE_ID}] Paramètres enregistrés`);
}


    // Token lecture pour sécuriser l'accès overlay (facultatif)
    game.settings.register(MODULE_ID, "readToken", {
        name: "Token de lecture (overlay)",
        hint: "Si renseigné, l’URL overlay doit contenir ?token=<valeur>. Laissez vide pour désactiver la vérification.",
        scope: "world",
        config: false,
        type: String,
        default: ""
    });
