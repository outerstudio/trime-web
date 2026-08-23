/**
 * Local Pages-like gateway: one origin, same path prefixes as production.
 *
 *   http://localhost:4173/                 → root hub
 *   http://localhost:4173/tool/      → tool (Vite :5173, BASE_PATH=/tool)
 *   http://localhost:4173/gallery/   → gallery (Vite :5174, BASE_PATH=/gallery)
 *
 * HMR WebSockets are proxied; set DEV_PROXY_PORT so Vite clients reconnect on this port.
 */
import { spawn } from "node:child_process";
import { createServer, request as httpRequest } from "node:http";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import httpProxy from "http-proxy";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "..");
const PROXY_PORT = Number(process.env.DEV_PROXY_PORT || 4173);
const TOOL_PORT = Number(process.env.DEV_TOOL_PORT || 5173);
const GALLERY_PORT = Number(process.env.DEV_GALLERY_PORT || 5174);

const hubHtml = readFileSync(join(root, "scripts", "root-hub.html"), "utf8");

/** @type {import('node:child_process').ChildProcess[]} */
const children = [];

function run(label, args, env = {}) {
    const child = spawn("npm", args, {
        cwd: root,
        env: { ...process.env, ...env },
        stdio: ["ignore", "pipe", "pipe"],
        shell: false,
    });
    children.push(child);
    const tag = `[${label}]`;
    child.stdout?.on("data", (buf) => {
        for (const line of String(buf).split(/\r?\n/)) {
            if (line) console.log(tag, line);
        }
    });
    child.stderr?.on("data", (buf) => {
        for (const line of String(buf).split(/\r?\n/)) {
            if (line) console.error(tag, line);
        }
    });
    child.on("exit", (code, signal) => {
        if (shuttingDown) return;
        console.error(`${tag} exited (code=${code}, signal=${signal})`);
        shutdown(code ?? 1);
    });
    return child;
}

let shuttingDown = false;
function shutdown(code = 0) {
    if (shuttingDown) return;
    shuttingDown = true;
    for (const child of children) {
        if (!child.killed) child.kill("SIGTERM");
    }
    process.exit(code);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

function waitForHttp(port, path = "/", attempts = 80) {
    return new Promise((resolveWait, reject) => {
        let left = attempts;
        const tryOnce = () => {
            const req = httpRequest(
                { hostname: "127.0.0.1", port, path, method: "GET", timeout: 500 },
                (res) => {
                    res.resume();
                    resolveWait();
                },
            );
            req.on("error", () => {
                left -= 1;
                if (left <= 0) reject(new Error(`timeout waiting for :${port}${path}`));
                else setTimeout(tryOnce, 250);
            });
            req.on("timeout", () => {
                req.destroy();
            });
            req.end();
        };
        tryOnce();
    });
}

const proxy = httpProxy.createProxyServer({ ws: true, xfwd: true });
proxy.on("error", (err, _req, res) => {
    console.error("[proxy]", err.message);
    if (res && "writeHead" in res && !res.headersSent) {
        res.writeHead(502, { "Content-Type": "text/plain; charset=utf-8" });
        res.end(`Bad gateway: ${err.message}`);
    }
});

run(
    "tool",
    ["run", "dev", "-w", "trime-web-tool", "--", "--host", "127.0.0.1", "--port", String(TOOL_PORT), "--strictPort"],
    {
        BASE_PATH: "/tool",
        DEV_PROXY_PORT: String(PROXY_PORT),
    },
);

run(
    "gallery",
    ["run", "dev", "-w", "trime-web-gallery", "--", "--host", "127.0.0.1", "--port", String(GALLERY_PORT), "--strictPort"],
    {
        BASE_PATH: "/gallery",
        DEV_PROXY_PORT: String(PROXY_PORT),
    },
);

await Promise.all([
    waitForHttp(TOOL_PORT, "/tool/"),
    waitForHttp(GALLERY_PORT, "/gallery/"),
]);

const server = createServer((req, res) => {
    const url = req.url || "/";
    if (url === "/" || url === "/index.html") {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(hubHtml);
        return;
    }
    if (url.startsWith("/tool")) {
        proxy.web(req, res, { target: `http://127.0.0.1:${TOOL_PORT}` });
        return;
    }
    if (url.startsWith("/gallery")) {
        proxy.web(req, res, { target: `http://127.0.0.1:${GALLERY_PORT}` });
        return;
    }
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found — try /tool/ or /gallery/");
});

server.on("upgrade", (req, socket, head) => {
    const url = req.url || "/";
    if (url.startsWith("/tool")) {
        proxy.ws(req, socket, head, { target: `http://127.0.0.1:${TOOL_PORT}` });
        return;
    }
    if (url.startsWith("/gallery")) {
        proxy.ws(req, socket, head, { target: `http://127.0.0.1:${GALLERY_PORT}` });
        return;
    }
    socket.destroy();
});

server.listen(PROXY_PORT, "127.0.0.1", () => {
    console.log("");
    console.log(`Pages-like gateway: http://127.0.0.1:${PROXY_PORT}/`);
    console.log(`  tool     → http://127.0.0.1:${PROXY_PORT}/tool/`);
    console.log(`  gallery  → http://127.0.0.1:${PROXY_PORT}/gallery/`);
    console.log("");
});
