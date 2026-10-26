/**
 * Monorepo true-src build: each packages/<name>/src -> dist (.js + .d.ts)
 *
 * Order: core -> auth -> orm -> redis/log/schedule/encrypt -> cli
 * core type-cycle: stubs live under packages/core/stubs (not peer dist).
 *
 *   npm run build:lib
 */
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const ORDER = [
  "core",
  "auth",
  "log",
  "orm",
  "redis",
  "schedule",
  "encrypt",
];

function run(cmd, cwd = root) {
  console.log(`[build:lib] $ ${cmd}`);
  const r = spawnSync(cmd, { cwd, stdio: "inherit", shell: true });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

function rmDist(pkgDir) {
  const dist = path.join(pkgDir, "dist");
  const buildInfo = path.join(pkgDir, "tsconfig.tsbuildinfo");
  const buildInfo2 = path.join(pkgDir, "tsconfig.build.tsbuildinfo");
  if (fs.existsSync(dist)) fs.rmSync(dist, { recursive: true, force: true });
  if (fs.existsSync(buildInfo)) fs.rmSync(buildInfo, { force: true });
  if (fs.existsSync(buildInfo2)) fs.rmSync(buildInfo2, { force: true });
}

/** Stubs for optional peers — kept inside core so clearing peer dist is safe */
function writeCoreStubs() {
  const stubsDir = path.join(root, "packages", "core", "stubs");
  fs.mkdirSync(stubsDir, { recursive: true });

  const files = {
    "orm.d.ts": `declare module "@pangza/orm" {
  export class QueryWrapper<T = any> {
    constructor(...args: any[]);
    [key: string]: any;
  }
  export type IPage<T = any> = {
    records: T[];
    total: number;
    size: number;
    current: number;
  };
  export type PageQuery = {
    current?: number;
    size?: number;
    [k: string]: any;
  };
  export type MapperTableOptions = Record<string, any>;
  export class BaseMapper<T = any> {
    [key: string]: any;
  }
  export function table(...args: any[]): any;
  const _default: any;
  export default _default;
}
declare module "@pangza/orm/*" {
  const mod: any;
  export = mod;
}
`,
    "auth.d.ts": `declare module "@pangza/auth" {
  export type AuthCheckMode = string | boolean | Record<string, any>;
  export class AuthUtil {
    static [key: string]: any;
  }
  const _default: any;
  export default _default;
}
declare module "@pangza/auth/*" {
  const mod: any;
  export = mod;
}
`,
    "redis.d.ts": `declare module "@pangza/redis" {
  export type RateLimitOption = Record<string, any>;
  export type RepeatSubmitOption = Record<string, any>;
  const _default: any;
  export default _default;
}
declare module "@pangza/redis/*" {
  const mod: any;
  export = mod;
}
`,
    "log.d.ts": `declare module "@pangza/log" {
  export type LogRecordOption = Record<string, any>;
  const _default: any;
  export default _default;
}
declare module "@pangza/log/*" {
  const mod: any;
  export = mod;
}
`,
  };

  for (const [name, body] of Object.entries(files)) {
    fs.writeFileSync(path.join(stubsDir, name), body);
  }

  // concrete subpath shims used as value imports from core
  const sub = {
    "orm-identifier.d.ts": `declare module "@pangza/orm/identifier" {
  export function getIdentifierGenerator(...args: any[]): any;
}
`,
    "orm-entityDecorators.d.ts": `declare module "@pangza/orm/entityDecorators" {
  export function getEntityTableMeta(...args: any[]): any;
}
`,
    "orm-sqlDecorators.d.ts": `declare module "@pangza/orm/sqlDecorators" {
  export const MAPPER_ENTITY_KEY: symbol;
}
`,
  };
  for (const [name, body] of Object.entries(sub)) {
    fs.writeFileSync(path.join(stubsDir, name), body);
  }
}

function writeCoreBuildTsconfig() {
  const cfg = {
    extends: "./tsconfig.json",
    compilerOptions: {
      composite: false,
      incremental: false,
      baseUrl: ".",
      paths: {
        inversify: [
          "./node_modules/inversify/lib/index.d.ts",
          "../../node_modules/inversify/lib/index.d.ts",
        ],
      },
    },
    include: ["src/**/*", "stubs/**/*.d.ts"],
    exclude: ["dist", "node_modules"],
  };
  const p = path.join(root, "packages", "core", "tsconfig.build.json");
  fs.writeFileSync(p, JSON.stringify(cfg, null, 2) + "\n");
}

function writeDepTsconfig(name, extraPaths = {}) {
  const cfg = {
    extends: "../../tsconfig.base.json",
    compilerOptions: {
      rootDir: "src",
      outDir: "dist",
      composite: false,
      incremental: false,
      baseUrl: ".",
      paths: {
        "@pangza/core": ["../core/dist/index"],
        "@pangza/core/*": ["../core/dist/*"],
        ...extraPaths,
        inversify: [
          "../core/node_modules/inversify/lib/index.d.ts",
          "../../node_modules/inversify/lib/index.d.ts",
        ],
      },
    },
    include: ["src/**/*"],
    exclude: ["dist", "node_modules"],
  };
  const p = path.join(root, "packages", name, "tsconfig.json");
  fs.writeFileSync(p, JSON.stringify(cfg, null, 2) + "\n");
}

function main() {
  if (!fs.existsSync(path.join(root, "packages", "core", "src"))) {
    console.error(
      "[build:lib] missing packages/core/src — run: node scripts/migrate-to-src-packages.js",
    );
    process.exit(1);
  }

  writeCoreStubs();
  writeCoreBuildTsconfig();
  writeDepTsconfig("auth");
  writeDepTsconfig("log", {
    "@pangza/auth": ["../auth/dist/index"],
    "@pangza/auth/*": ["../auth/dist/*"],
  });
  writeDepTsconfig("orm", {
    "@pangza/auth": ["../auth/dist/index"],
    "@pangza/auth/*": ["../auth/dist/*"],
  });
  writeDepTsconfig("redis", {
    "@pangza/auth": ["../auth/dist/index"],
    "@pangza/auth/*": ["../auth/dist/*"],
    "@pangza/log": ["../log/dist/index"],
    "@pangza/log/*": ["../log/dist/*"],
  });
  writeDepTsconfig("schedule", {
    "@pangza/orm": ["../orm/dist/index"],
    "@pangza/orm/*": ["../orm/dist/*"],
  });
  writeDepTsconfig("encrypt");

  // also disable composite on core base tsconfig for clean emit
  const coreTs = {
    extends: "../../tsconfig.base.json",
    compilerOptions: {
      rootDir: "src",
      outDir: "dist",
      composite: false,
      incremental: false,
    },
    include: ["src/**/*"],
    exclude: ["dist", "node_modules", "stubs"],
  };
  fs.writeFileSync(
    path.join(root, "packages", "core", "tsconfig.json"),
    JSON.stringify(coreTs, null, 2) + "\n",
  );

  const tsc = path.join(root, "node_modules", ".bin", "tsc");
  const tscBin = fs.existsSync(tsc) ? `"${tsc}"` : "pnpm exec tsc";

  for (const dir of ORDER) {
    const pkgDir = path.join(root, "packages", dir);
    rmDist(pkgDir);
    const tsconfig = dir === "core" ? "tsconfig.build.json" : "tsconfig.json";
    run(`${tscBin} -p ${tsconfig}`, pkgDir);

    // sanity: require index.js
    const indexJs = path.join(pkgDir, "dist", "index.js");
    if (!fs.existsSync(indexJs)) {
      console.error(`[build:lib] missing ${indexJs}`);
      process.exit(1);
    }
    console.log(`[build:lib] built @pangza/${dir}`);
  }

  console.log("[build:lib] done: each package dist has .js + .d.ts");
  console.log("[build:lib] CLI lives in ../pangza-cli (npm package name: pangza)");
}

main();
