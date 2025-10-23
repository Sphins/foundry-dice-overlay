// scripts/overlay-socket.js
const MODULE_ID = "foundry-dice-overlay";

/**
 * Diffuse les données vers l'overlay :
 * - BroadcastChannel (canal namespacé par monde)
 * - localStorage (fallback, clés namespacées par monde)
 * - Hub WebSocket (optionnel)
 */
export class OverlaySocket {
    static bc = null;

    // --- HUB WS ---
    static hubWS = null;
    static hubUrl = null;
    static hubChannel = null;

    /** Nom du canal et clés, toujours namespacés par monde */
    static get worldId() {
        return game.world?.id || "default";
    }
    static get channelName() {
        return `${MODULE_ID}:${this.worldId}`;
    }
    static get keyLast() {
        return `${MODULE_ID}:${this.worldId}:last`;
    }
    static get keyConf() {
        return `${MODULE_ID}:${this.worldId}:conf`;
    }

    static init() {
        try {
            this.bc = new BroadcastChannel(this.channelName);
            console.log(`[${MODULE_ID}] BroadcastChannel prêt : ${this.channelName}`);
        } catch (e) {
            this.bc = null;
            console.warn(`[${MODULE_ID}] BroadcastChannel indisponible, fallback localStorage.`);
        }
    }

    /** Connexion au hub WS (Cloudflare Worker, etc.) */
    static connectHub(hubUrl, channel) {
        if (!hubUrl) return;
        this.hubUrl = hubUrl;
        this.hubChannel = channel || this.channelName;

        const url = `${hubUrl}?channel=${encodeURIComponent(this.hubChannel)}`;
        try {
            this.hubWS = new WebSocket(url);
            this.hubWS.onopen = () => console.log(`[${MODULE_ID}] Hub connecté: ${url}`);
            this.hubWS.onerror = (e) => console.error(`[${MODULE_ID}] Hub WS error`, e);
            this.hubWS.onclose = () => console.warn(`[${MODULE_ID}] Hub WS fermé.`);
        } catch (e) {
            console.error(`[${MODULE_ID}] Impossible d’ouvrir le hub WS`, e);
        }
    }

    /** Envoie une donnée “jet” vers l’overlay */
    static send(data) {
        const json = typeof data === "string" ? data : JSON.stringify(data);

        // 1) BroadcastChannel
        if (this.bc) {
            try { this.bc.postMessage(json); } catch (_) { }
        }

        // 2) localStorage (fallback)
        try { localStorage.setItem(this.keyLast, `${Date.now()}|${json}`); } catch (_) { }

        // 3) Hub Cloudflare (si ouvert)
        if (this.hubWS && this.hubWS.readyState === WebSocket.OPEN) {
            try { this.hubWS.send(json); } catch (_) { }
        }
    }

    /**
     * Pousse la configuration courante (HTML/CSS/JS, options)
     * vers l’overlay. L’overlay reconnaît l’objet via __fdoType: "config".
     */
    static pushConfig() {
        const get = (k) => game.settings.get(MODULE_ID, k);

        const payload = {
            __fdoType: "config",
            world: this.worldId,
            config: {
                html: get("customHtml") || "",
                css: get("customCss") || "",
                js: get("customJs") || "",
                enableJs: !!get("enableJs"),
                displayDuration: Number(get("displayDuration")) || 8,
                displayMode: get("displayMode") || "single",
                filterGmRolls: get("filterGmRolls") || "showAll",
                systemUsed: get("systemUsed") || "",
                hubUrl: get("hubUrl") || ""
            }
        };

        const json = JSON.stringify(payload);

        // 1) BroadcastChannel
        if (this.bc) {
            try { this.bc.postMessage(json); } catch (_) { }
        }

        // 2) localStorage (permet l’auto-prise en compte par l’overlay)
        try { localStorage.setItem(this.keyConf, json); } catch (_) { }

        // 3) Hub (facultatif) — pas d’envoi de config au hub par défaut
        console.log(`[${MODULE_ID}] Config poussée vers overlay (world=${this.worldId}).`);
    }
}
