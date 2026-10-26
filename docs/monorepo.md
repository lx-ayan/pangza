# Pangza Monorepo

本仓库（`pangza/`）是框架源码唯一位置。业务应用（如 `pangza-admin-express`、`bbb`）通过依赖 `@pangza/*` 引用，不要再把框架源码写进业务仓库。

## 布局

```
pangza/
  packages/
    core/src/     → dist/
    orm/src/
    auth/src/
    ...
  scripts/build-lib.js

CLI → ../pangza-cli （pangza init / pangza g）
```


## 命令

```bash
pnpm install
pnpm run build:lib
pnpm run publish:lib
```
