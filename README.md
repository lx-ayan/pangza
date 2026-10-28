# Pangza

TypeScript monorepo for the Pangza Express framework.

- GitHub: https://github.com/lx-ayan/pangza
- License: MIT

## Packages

| Package | Description |
|---------|-------------|
| `@pangza/core` | Application / IoC / Logger / config / Json / Exception / AOP / Filter |
| `@pangza/orm` | Db / Mapper / QueryWrapper |
| `@pangza/auth` | Auth / session |
| `@pangza/redis` | Redis / rate limit / lock |
| `@pangza/log` | Operation audit log |
| `@pangza/schedule` | Cron jobs |
| `@pangza/encrypt` | AES helpers |
| `@pangza/validate` | Parameter validation |

Source lives in `packages/*/src` and builds to `packages/*/dist` (`.js` + `.d.ts`).

CLI（`pangza init` / `pangza g`）在独立仓库目录：`../pangza-cli`（npm 包名 `pangza`）。

## Develop

```bash
pnpm install
pnpm run build:lib
```

## Publish

```bash
pnpm run build:lib
pnpm run publish:lib
pnpm run publish:lib -- --with-cli
```

## Use

```bash
npm i @pangza/core express inversify reflect-metadata
# optional
npm i @pangza/orm mysql2
```

```ts
import { Application, Controller, GetMapping, Logger } from "@pangza/core";
```
