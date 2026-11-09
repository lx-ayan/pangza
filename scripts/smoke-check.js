/**
 * Smoke: core exports + Filter/Interceptor symbols + all package dist present.
 *   node scripts/smoke-check.js
 */
const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..");

process.chdir(root);

const core = require(path.join(root, "packages/core/dist"));
const required = [
  "Application",
  "Controller",
  "GetMapping",
  "PostMapping",
  "RequestBody",
  "RequestForm",
  "RequestQuery",
  "WebFilter",
  "Interceptor",
  "Logger",
  "ParamType",
];

const missing = required.filter((k) => core[k] == null);
if (missing.length) {
  console.error("[smoke] missing exports:", missing.join(", "));
  process.exit(1);
}

if (core.ParamType.FORM !== "form") {
  console.error("[smoke] ParamType.FORM expected 'form'");
  process.exit(1);
}

const aopLeftovers = [
  "Around",
  "Before",
  "After",
  "AfterReturning",
  "AfterThrowing",
  "createAroundDecorator",
  "markAdvice",
  "registerAroundAdvice",
  "getMethodInvocationContext",
].filter((k) => core[k] != null);
if (aopLeftovers.length) {
  console.error("[smoke] AOP exports should be removed:", aopLeftovers.join(", "));
  process.exit(1);
}

for (const name of [
  "core",
  "auth",
  "orm",
  "redis",
  "log",
  "schedule",
  "encrypt",
  "validate",
]) {
  const idx = path.join(root, "packages", name, "dist", "index.js");
  if (!fs.existsSync(idx)) {
    console.error("[smoke] missing dist:", idx);
    process.exit(1);
  }
}

const F = core.WebFilter({ order: 1, urlPatterns: ["/**"] });
const I = core.Interceptor({ order: 0, include: ["/**"] });
if (typeof F !== "function" || typeof I !== "function") {
  console.error("[smoke] WebFilter/Interceptor decorator factory broken");
  process.exit(1);
}

console.log("[smoke] ok");
