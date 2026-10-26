/**
 * Publish @pangza/* from this repo (pangza/).
 *
 *   npm run build:lib
 *   npm run publish:lib
 *   npm run publish:lib -- --with-cli
 *   npm run publish:lib -- --dry-run
 */
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const REGISTRY = "https://registry.npmjs.org";
const rootVersion = require(path.join(root, "package.json")).version;

const PACKAGES = [
  "packages/core",
  "packages/orm",
  "packages/auth",
  "packages/redis",
  "packages/log",
  "packages/schedule",
  "packages/encrypt",
];

const DEP_FIELDS = [
  "dependencies",
  "optionalDependencies",
  "peerDependencies",
  "devDependencies",
];

function parseArgs(argv) {
  let otp = "";
  let dryRun = false;
  let withCli = false;
  for (const a of argv) {
    if (a === "--dry-run") dryRun = true;
    else if (a === "--with-cli") withCli = true;
    else if (a.startsWith("--otp=")) otp = a.slice("--otp=".length).trim();
  }
  const otpIdx = argv.indexOf("--otp");
  if (otpIdx >= 0 && argv[otpIdx + 1] && !argv[otpIdx + 1].startsWith("-")) {
    otp = argv[otpIdx + 1].trim();
  }
  return { otp, dryRun, withCli };
}

/** workspace:* / file: → ^<rootVersion> for publish; restore after */
function withPublishablePackageJson(rel, fn) {
  const pkgPath = path.join(root, rel, "package.json");
  const original = fs.readFileSync(pkgPath, "utf8");
  const pkg = JSON.parse(original);
  for (const field of DEP_FIELDS) {
    const deps = pkg[field];
    if (!deps || typeof deps !== "object") continue;
    for (const [name, spec] of Object.entries(deps)) {
      const s = String(spec);
      if (
        s.startsWith("workspace:") ||
        s.startsWith("file:") ||
        s.startsWith("link:")
      ) {
        if (name.startsWith("@pangza/") || name === "pangza") {
          deps[name] = `^${rootVersion}`;
        }
      }
    }
  }
  pkg.version = rootVersion;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  try {
    return fn();
  } finally {
    fs.writeFileSync(pkgPath, original);
  }
}

function assertCoreExports() {
  // core config loads application.yaml from cwd — use repo root (has one for smoke)
  const prev = process.cwd();
  try {
    process.chdir(root);
    const main = require(path.join(
      root,
      "packages",
      "core",
      "dist",
      "index.js",
    ));
    for (const key of [
      "Application",
      "Service",
      "Resource",
      "Logger",
      "Controller",
    ]) {
      if (main[key] == null) {
        throw new Error(`[publish:lib] @pangza/core missing export: ${key}`);
      }
    }
    console.log("[publish:lib] @pangza/core exports OK");
  } finally {
    process.chdir(prev);
  }
}

function publishDir(rel, { otp, dryRun }) {
  withPublishablePackageJson(rel, () => {
    const cwd = path.join(root, rel);
    const args = ["publish", "--access", "public", `--registry=${REGISTRY}`];
    if (dryRun) args.push("--dry-run");
    if (otp) args.push(`--otp=${otp}`);
    console.log(`\n[publish:lib] -> ${rel}`);
    const r = spawnSync("npm", args, { cwd, stdio: "inherit", shell: true });
    if (r.status !== 0) {
      console.error(`[publish:lib] failed: ${rel} (exit ${r.status})`);
      process.exit(r.status || 1);
    }
  });
}

function main() {
  const { otp, dryRun, withCli } = parseArgs(process.argv.slice(2));
  if (!otp && !dryRun) {
    console.log(
      "[publish:lib] no --otp: confirm Security Key in browser if prompted",
    );
  }

  if (!fs.existsSync(path.join(root, "packages", "core", "dist", "index.js"))) {
    console.error("[publish:lib] run build:lib first");
    process.exit(1);
  }

  if (withCli) {
    console.log(
      "[publish:lib] CLI is in ../pangza-cli — publish there: cd ../pangza-cli && npm publish",
    );
  }

  try {
    assertCoreExports();
  } catch (e) {
    console.error(e.message || e);
    process.exit(1);
  }

  for (const rel of PACKAGES) publishDir(rel, { otp, dryRun });
  console.log("\n[publish:lib] done");
}

main();
