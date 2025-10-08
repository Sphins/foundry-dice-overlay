// scripts/overlay-socket.js

export class OverlaySocket {
    static clients = new Set();

    static init(app) {
        app.get("/modules/foundry-dice-overlay/stream", (req, res) => {
            const url = new URL(req.protocol + "://" + req.get("host") + req.originalUrl);
        const token = url.searchParams.get("token");
        const expected = game.settings.get("foundry-dice-overlay", "readToken") || "";
        if (expected && token !== expected) {
            res.status(401).end("Unauthorized");
            return;
        }

        res.writeHead(200, {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Access-Control-Allow-Origin": "*"
            });

            res.write("\n"); // init
            OverlaySocket.clients.add(res);

            req.on("close", () => {
                OverlaySocket.clients.delete(res);
            });
        });

        console.log("✅ [foundry-dice-overlay] SSE overlay server ready.");
    }

    static send(data) {
        const json = JSON.stringify(data);
        for (const client of OverlaySocket.clients) {
            client.write(`data: ${json}\n\n`);
        }
    }
}
