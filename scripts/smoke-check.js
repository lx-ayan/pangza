/**
 * Smoke: core exports + AOP + Filter/Interceptor symbols + all package dist present.
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
  "Around",
  "Before",
  "After",
  "createAroundDecorator",
  "markAdvice",
  "registerAroundAdvice",
  "getMethodInvocationContext",
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

(async () => {
  const hits = [];
  const Deco = core.createAroundDecorator(async (inv) => {
    hits.push("around");
    inv.args[0] = Number(inv.args[0]) + 1;
    return inv.proceed();
  }, { order: 1 });

  class Demo {
    async run(n) {
      hits.push("body");
      return n * 2;
    }
  }

  const desc = Object.getOwnPropertyDescriptor(Demo.prototype, "run");
  Deco(Demo.prototype, "run", desc);
  Object.defineProperty(Demo.prototype, "run", desc);

  const out = await new Demo().run(3);
  if (out !== 8 || hits.join(",") !== "around,body") {
    console.error("[smoke] AOP failed", { out, hits });
    process.exit(1);
  }

  const markKey = Symbol("smoke-mark");
  core.registerAroundAdvice(
    markKey,
    async (inv) => {
      hits.push("mark");
      return inv.proceed();
    },
    { order: 0 },
  );

  class Marked {
    async work() {
      hits.push("work");
      return 1;
    }
  }
  hits.length = 0;
  const mdesc = Object.getOwnPropertyDescriptor(Marked.prototype, "work");
  core.markAdvice(markKey)(Marked.prototype, "work", mdesc);
  Object.defineProperty(Marked.prototype, "work", mdesc);
  await new Marked().work();
  if (hits.join(",") !== "mark,work") {
    console.error("[smoke] markAdvice failed", { hits });
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

  // Filter / Interceptor class decorators should be callable
  const F = core.WebFilter({ order: 1, urlPatterns: ["/**"] });
  const I = core.Interceptor({ order: 0, include: ["/**"] });
  if (typeof F !== "function" || typeof I !== "function") {
    console.error("[smoke] WebFilter/Interceptor decorator factory broken");
    process.exit(1);
  }

  console.log("[smoke] ok");
})().catch((err) => {
  console.error("[smoke] failed", err);
  process.exit(1);
});
