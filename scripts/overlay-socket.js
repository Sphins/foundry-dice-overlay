const MODULE_ID = "foundry-dice-overlay";

export class OverlaySocket {
    static channelName = MODULE_ID;
    static bc = null;

    // --- HUB WS ---
    static hubWS = null;
    static hubUrl = null;
    static hubChannel = null;

    static init() {
        try {
            this.bc = new BroadcastChannel(this.channelName);
            console.log(`[${MODULE_ID}] BroadcastChannel prêt : ${this.channelName}`);
        } catch (e) {
            this.bc = null;
            console.warn(`[${MODULE_ID}] BroadcastChannel indisponible, fallback localStorage.`);
        }
    }

    static connectHub(hubUrl, channel) {
        if (!hubUrl) return;
        this.hubUrl = hubUrl;
        this.hubChannel = channel;

        const url = `${hubUrl}?channel=${encodeURIComponent(channel)}`;
        try {
            this.hubWS = new WebSocket(url);
            this.hubWS.onopen = () => console.log(`[${MODULE_ID}] Hub connecté: ${url}`);
            this.hubWS.onerror = (e) => console.error(`[${MODULE_ID}] Hub WS error`, e);
            this.hubWS.onclose = () => console.warn(`[${MODULE_ID}] Hub WS fermé.`);
        } catch (e) {
            console.error(`[${MODULE_ID}] Impossible d’ouvrir le hub WS`, e);
        }
    }

    static send(data) {
        const json = JSON.stringify(data);

        // 1) BroadcastChannel
        if (this.bc) {
            try { this.bc.postMessage(json); } catch (_) { /* ignore */ }
        }

        // 2) localStorage (fallback)
        try { localStorage.setItem(`${MODULE_ID}:last`, `${Date.now()}|${json}`); } catch (_) { }

        // 3) Hub Cloudflare (si ouvert)
        if (this.hubWS && this.hubWS.readyState === WebSocket.OPEN) {
            try { this.hubWS.send(json); } catch (_) { }
        }
    }
}
