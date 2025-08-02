export class KnightRollFormatter {

    static id = "knight";
    static label = "Knight";

    static supports(systemId) {
        return systemId === this.id;
    }

    static extractData(message) {
        const actor = message.speaker?.alias ?? "Inconnu";
        const html = message.content ?? "";
        const doc = new DOMParser().parseFromString(html, "text/html");

        const data = {
            system: "knight",
            actor,
            type: null,               // characteristic | attack | damage | violence | other
            flavor: null,            // Texte dans .dice-flavor
            caracs: [],              // [Carac 1, Carac 2]
            formula: null,           // Ex: "2D6 + 1"
            total: null,             // Nombre de succès ou valeur
            dice: [],                // [{ value: 3, class: "roll d6 fail" }]
            isCrit: false,           // Echec critique
            isExploit: false,        // Exploit
            weapon: null,            // Nom de l’arme (s’il y en a)
            effects: [],             // Ex: ["Perce Armure 40", ...]
        };

        // 🎭 Flavor principal
        const flavor = doc.querySelector(".dice-flavor")?.textContent.trim();
        data.flavor = flavor || null;

        // 🎯 Type de jet
        const formulaLabel = doc.querySelector(".dice-formula")?.textContent.trim().toLowerCase() ?? "";
        const flavorLower = flavor?.toLowerCase() ?? "";

        if (formulaLabel.includes("dégâts")) data.type = "damage";
        else if (formulaLabel.includes("violence")) data.type = "violence";
        else if (flavorLower.includes("contact") || flavorLower.includes("tir")) data.type = "attack";
        else if (doc.querySelector(".caracs")) data.type = "characteristic";
        else data.type = "other";

        // ⚔️ Arme (flavor typiquement "Marteau-épieu - Contact")
        if (data.type === "attack" || data.type === "damage" || data.type === "violence") {
            const weaponName = flavor?.split("-")?.[0]?.trim();
            if (weaponName) data.weapon = weaponName;
        }

        // 🎲 Caractéristiques
        const caracText = doc.querySelector(".caracs")?.textContent;
        if (caracText) {
            data.caracs = caracText.split("/").map((c) => c.trim());
        }

        // 🧨 Exploit / Critique
        const hasExploit = doc.querySelector(".explode");
        const hasCritFail = doc.querySelector(".epicFail");

        data.isExploit = !!hasExploit;
        data.isCrit = !!hasCritFail;

        // 🧮 Formule (ex: 2D6 + 1)
        const formula = doc.querySelector(".part-formula")?.getAttribute("title");
        if (formula) data.formula = formula.trim();

        // 🔢 Total
        const totalStr = doc.querySelector(".part-total")?.textContent.trim();
        const total = parseInt(totalStr);
        if (!isNaN(total)) data.total = total;

        // 🎲 Dés bruts
        const diceElems = doc.querySelectorAll(".dice-rolls li");
        data.dice = Array.from(diceElems).map((li) => ({
            value: parseInt(li.textContent),
            class: li.className,
        }));

        // ✨ Effets spéciaux
        const effectBlocks = doc.querySelectorAll(".details");
        data.effects = Array.from(effectBlocks).map((el) => {
            const label = el.querySelector(".label")?.textContent?.trim();
            return label ?? null;
        }).filter(Boolean);

        return data;
    }
}
