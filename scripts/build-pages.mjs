import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "..");
const configPath = join(root, "pages.sites.json");
const config = JSON.parse(readFileSync(configPath, "utf8"));

/** @typedef {{ workspace: string, basePath?: string, buildDir?: string, skip?: boolean }} Site */

/** @type {Site[]} */
const sites = (config.sites ?? []).filter((s) => !s.skip);
const outDir = resolve(root, config.outDir ?? "dist-pages");

function run(args, env = {}) {
    const result = spawnSync("npm", args, {
        cwd: root,
        env: { ...process.env, ...env },
        stdio: "inherit",
        shell: false,
    });
    if (result.status !== 0) process.exit(result.status ?? 1);
}

function normalizeBase(basePath) {
    if (!basePath || basePath === "/") return "";
    return basePath.startsWith("/") ? basePath.replace(/\/$/, "") : `/${basePath.replace(/\/$/, "")}`;
}

function segmentFromBase(basePath) {
    const base = normalizeBase(basePath);
    return base ? base.slice(1) : "";
}

console.log("→ package trime-web-core");
run(["run", "package", "-w", "trime-web-core"]);

for (const site of sites) {
    const base = normalizeBase(site.basePath ?? "/");
    const envBase = base || "/";
    console.log(`→ build ${site.workspace} (BASE_PATH=${envBase})`);
    run(["run", "build", "-w", site.workspace], { BASE_PATH: envBase });
}

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

for (const site of sites) {
    const buildDir = site.buildDir ?? "build";
    const src = join(root, "packages", site.workspace, buildDir);
    if (!existsSync(src)) {
        console.error(`Missing build output: ${src}`);
        process.exit(1);
    }
    const segment = segmentFromBase(site.basePath ?? "/");
    const dest = segment ? join(outDir, segment) : outDir;
    mkdirSync(dest, { recursive: true });
    cpSync(src, dest, { recursive: true });
    console.log(`→ assembled ${site.workspace} → ${segment ? `${config.outDir}/${segment}` : config.outDir}/`);
}

writeFileSync(join(outDir, ".nojekyll"), "");
console.log(`→ wrote ${config.outDir}/.nojekyll`);

if (config.customDomain) {
    writeFileSync(join(outDir, "CNAME"), `${config.customDomain}\n`);
    console.log(`→ wrote ${config.outDir}/CNAME (${config.customDomain})`);
}

const hubTemplate = join(root, "scripts", "root-hub.html");
if (config.rootHub !== false && existsSync(hubTemplate)) {
    cpSync(hubTemplate, join(outDir, "index.html"));
    console.log(`→ wrote ${config.outDir}/index.html (root hub)`);
} else if (config.rootRedirect) {
    const target = config.rootRedirect.startsWith("/")
        ? config.rootRedirect
        : `/${config.rootRedirect}`;
    const html = `<!DOCTYPE html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta http-equiv="refresh" content="0;url=${target}">
<link rel="canonical" href="${target}">
<title>Redirecting…</title>
<script>location.replace(${JSON.stringify(target)})</script>
</head>
<body>
<p><a href="${target}">Continue to ${target}</a></p>
</body>
</html>
`;
    writeFileSync(join(outDir, "index.html"), html);
    console.log(`→ wrote ${config.outDir}/index.html → ${target}`);
}

console.log("Pages artifact ready:", outDir);
