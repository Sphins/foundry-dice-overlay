import { getSystemFormatters } from "./systems/index.js";

export class RollFormatter {
    static extractData(message) {
        const systemId = game.settings.get("foundry-dice-overlay", "systemUsed");
        const formatter = this.getFormatterForSystem(systemId);
        return formatter?.extractData?.(message) ?? null;
    }

    static getFormatterForSystem(systemId) {
        return getSystemFormatters().find(f => f.supports?.(systemId));
    }

    static getSupportedSystems() {
        return getSystemFormatters().map(f => ({
            id: f.id,
            label: f.label ?? f.id
        }));
    }

}
