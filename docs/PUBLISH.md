# 发包手册（@pangza/* + CLI）

**可以发了。** 当前 `1.1.7` 已能完整 `build:lib`。下面按顺序在你本机终端操作（2FA / Security Key 需要你确认）。

## 发哪些包

| 目录 | npm 包名 | 说明 |
|------|----------|------|
| `pangza/packages/core` | `@pangza/core` | 必发，先发（Application / IoC / config / Json / Exception） |
| `pangza/packages/orm` | `@pangza/orm` | ORM；含 `@Mapper` / `MapperType` |
| `pangza/packages/validate` | `@pangza/validate` | 参数校验；含 `@Validate` |
| `pangza/packages/auth` | `@pangza/auth` | |
| `pangza/packages/redis` | `@pangza/redis` | |
| `pangza/packages/log` | `@pangza/log` | |
| `pangza/packages/schedule` | `@pangza/schedule` | |
| `pangza/packages/encrypt` | `@pangza/encrypt` | |
| `pangza-cli/` | `pangza` | CLI：`pangza init` / `pangza g` |

> 脚本会把 `workspace:*` 临时改成 `^1.1.7` 再 publish，发完自动还原，不用手改。

## 导入约定（1.1.0）

```ts
import { Application, Service, BaseService, Value } from "@pangza/core";
import { Mapper, MapperType, EnableOrm } from "@pangza/orm";
import { Validate, NotNull } from "@pangza/validate";
import Redis, { EnableRedis } from "@pangza/redis";
```

`pangza init --modules=validate` 会写入 `@pangza/validate` 依赖。

## 0. 登录 npm（只需一次）

```bash
npm whoami
# 若未登录：
npm login
# 或用 Access Token：npm config set //registry.npmjs.org/:_authToken=npm_xxx
```

有 2FA / Security Key 时，发布过程中浏览器或 OTP 弹窗按提示确认即可。

## 1. 构建框架包

```bash
cd d:\workspace\project\person\group\pangza
pnpm install
pnpm run build:lib
```

确认输出末尾有：`done: each package dist has .js + .d.ts`。

## 2. 先 dry-run（强烈建议）

```bash
pnpm run publish:lib:dry
# 等价：node scripts/publish-lib.js --dry-run
```

看 tarball 里是否只有 `dist/` + `README.md`，且依赖不是 `workspace:*` / `file:`。

## 3. 正式发布 @pangza/*

```bash
cd d:\workspace\project\person\group\pangza
pnpm run publish:lib
```

若 CLI 要求一次性 OTP：

```bash
node scripts/publish-lib.js --otp=123456
```

顺序：`core → orm → auth → redis → log → schedule → encrypt → validate`（脚本内已排好）。

## 4. 发布 CLI（另目录）

```bash
cd d:\workspace\project\person\group\pangza-cli
npm publish --access public
# 有 OTP：
npm publish --access public --otp=123456
```

验证：

```bash
npx pangza --help
npx pangza init demo-app --modules=orm,validate --db=mysql
```

## 5. 发完自检

```bash
npm view @pangza/core version
npm view @pangza/orm version
npm view @pangza/validate version
npm view pangza version
```

用户侧最小安装：

```bash
npm i @pangza/core express inversify reflect-metadata
# 需要校验时：
npm i @pangza/validate
```

## 注意

1. **版本**：根目录与各包当前都是 `1.1.7`。若 npm 上已有同名同版本，要么升版本再发，要么无法覆盖。
2. **不要**在 `packages/*/package.json` 里长期写成 `file:` 再发布；日常开发用 `workspace:*`，交给 `publish-lib.js` 改写。
3. **破坏性变更**：`Validate` 不再从 `@pangza/core` / Application 导出；`Mapper` / `MapperType` 改从 `@pangza/orm` 导入。

## 常用命令速查

```bash
# 框架
cd pangza && pnpm run build:lib && pnpm run publish:lib:dry && pnpm run publish:lib

# CLI
cd pangza-cli && npm publish --access public
```
