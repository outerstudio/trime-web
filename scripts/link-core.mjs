import { mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const prefix = join(homedir(), ".npm-global");
mkdirSync(prefix, { recursive: true });

const env = {
    ...process.env,
    npm_config_prefix: prefix,
    PATH: `${join(prefix, "bin")}${process.env.PATH ? `:${process.env.PATH}` : ""}`,
};

function run(args, cwd) {
    const result = spawnSync("npm", args, { stdio: "inherit", cwd, env, shell: false });
    if (result.status !== 0) process.exit(result.status ?? 1);
}

run(["ci"], "trime-web-core");
run(["link"], "trime-web-core");
run(["link", "trime-web-core"]);
