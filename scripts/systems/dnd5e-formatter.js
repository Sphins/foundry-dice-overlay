export class Dnd5eRollFormatter {

    static id = "dnd5e";
    static label = "D&D 5e";

    static supports(systemId) {
        return systemId === this.id;
    }

    /**
     * Analyse un ChatMessage et extrait les données pertinentes
     * @param {ChatMessage} message
     * @returns {object|null}
     */
    static extractData(message) {
        const roll = message.rolls?.[0];
        const flavor = message.flavor ?? "";
        const actor = message.speaker?.alias ?? "Unknown";
        const formula = roll?.formula ?? "";
        const total = roll?.total ?? null;

        const data = {
            system: "dnd5e",
            actor,
            formula,
            total,
            flavor: flavor,
            type: null,
            ability: null,
            skill: null,
            isAttack: false,
            isDamage: false
        };

        // 🔍 Analyse du texte flavor pour détecter le type de jet
        const flavorLower = flavor.toLowerCase();

        if (flavorLower.includes("ability check")) {
            data.type = "ability";
            data.ability = this.extractAbilityFromFlavor(flavorLower);
        } else if (flavorLower.includes("saving throw")) {
            data.type = "save";
            data.ability = this.extractAbilityFromFlavor(flavorLower);
        } else if (flavorLower.includes("check")) {
            data.type = "skill";
            data.skill = this.extractSkillFromFlavor(flavorLower);
        } else if (flavorLower.includes("attack roll")) {
            data.type = "attack";
            data.isAttack = true;
        } else if (flavorLower.includes("damage roll")) {
            data.type = "damage";
            data.isDamage = true;
        } else {
            data.type = "other";
        }

        return data;
    }

    /**
     * Extrait la caractéristique (STR, DEX, etc.) depuis le flavor
     */
    static extractAbilityFromFlavor(flavor) {
        const map = {
            strength: "STR",
            dexterity: "DEX",
            constitution: "CON",
            intelligence: "INT",
            wisdom: "WIS",
            charisma: "CHA"
        };

        for (const [key, value] of Object.entries(map)) {
            if (flavor.includes(key)) return value;
        }

        return null;
    }

    /**
     * Extrait la compétence (Investigation, Stealth...) depuis le flavor
     */
    static extractSkillFromFlavor(flavor) {
        const skills = [
            "acrobatics", "animal handling", "arcana", "athletics", "deception",
            "history", "insight", "intimidation", "investigation", "medicine",
            "nature", "perception", "performance", "persuasion", "religion",
            "sleight of hand", "stealth", "survival"
        ];

        for (const skill of skills) {
            if (flavor.includes(skill)) {
                return skill.replace(/\b\w/g, l => l.toUpperCase()); // Capitalize
            }
        }

        return null;
    }

    static getOverlayKeys() {
        return [
            { id: "actor", i18n: "MODULE.OVERLAY.Data.actor" },
            { id: "formula", i18n: "MODULE.OVERLAY.Data.formula" },
            { id: "total", i18n: "MODULE.OVERLAY.Data.total" },
            { id: "flavor", i18n: "MODULE.OVERLAY.Data.flavor" },
            { id: "type", i18n: "MODULE.OVERLAY.Data.type" },
            { id: "ability", i18n: "MODULE.OVERLAY.Data.ability" },
            { id: "skill", i18n: "MODULE.OVERLAY.Data.skill" },
            { id: "isAttack", i18n: "MODULE.OVERLAY.Data.isAttack" },
            { id: "isDamage", i18n: "MODULE.OVERLAY.Data.isDamage" }
        ];
    }

}

