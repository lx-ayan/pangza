import { optionalRequire } from "../optional";

/**
 * @deprecated 请用实体 `@TableId({ type: IdType.ASSIGN_ID })`（全局默认已是 ASSIGN_ID），
 * insert 时自动生成；或 `getIdentifierGenerator().nextId()`。
 */
export function nextId(): string {
  const mod =
    optionalRequire("@pangza/orm/identifier") ??
    optionalRequire("@pangza/orm");
  const gen = mod?.getIdentifierGenerator?.();
  if (!gen?.nextId) {
    throw new Error(
      "[nextId] 需要安装 @pangza/orm 才能生成分布式 ID",
    );
  }
  const id = gen.nextId();
  return typeof id === "string" ? id : String(id);
}
