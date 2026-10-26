import "reflect-metadata";
import { Container } from "@pangza/core";
import type { Ctor } from "@pangza/core";
import type { BaseMapper } from "./BaseMapper";
import { getEntityTableMeta } from "./entityDecorators";
import { MAPPER_ENTITY_KEY } from "./sqlDecorators";
import { table } from "./table";
import type { MapperTableOptions } from "./types";

/** BaseMapper 需混入到 @Mapper 类的方法名 */
export const MAPPER_DELEGATE_METHODS = [
  "selectById",
  "selectOne",
  "selectList",
  "selectCount",
  "selectPage",
  "insert",
  "saveBatch",
  "updateById",
  "update",
  "deleteById",
  "deleteByIds",
  "delete",
] as const;

export type MapperDelegateMethod = (typeof MAPPER_DELEGATE_METHODS)[number];

type EntityCtor = new (...args: any[]) => object;

function resolveMapperBinding(
  tableOrEntity: string | EntityCtor,
  idFieldOrOptions: string | MapperTableOptions = "id",
): { tableName: string; options: string | MapperTableOptions } {
  if (typeof tableOrEntity === "string") {
    return { tableName: tableOrEntity, options: idFieldOrOptions };
  }

  const meta = getEntityTableMeta(tableOrEntity);
  if (!meta?.tableName) {
    throw new Error(`[Mapper] 实体 ${tableOrEntity.name} 缺少 @TableName`);
  }

  const base: MapperTableOptions =
    typeof idFieldOrOptions === "string"
      ? { idField: idFieldOrOptions }
      : { ...(idFieldOrOptions ?? {}) };

  return {
    tableName: meta.tableName,
    options: {
      idField: base.idField ?? meta.idColumn,
      ...base,
      entity: tableOrEntity,
    },
  };
}

/**
 * @Mapper(table | Entity, idField | options?)
 * 混入 BaseMapper CRUD，并按「类」绑定到容器。
 *
 * @example
 * @Mapper(UserEntity, { logicDelete: true })
 * class UserMapper {}
 */
export function Mapper(
  tableOrEntity: string | EntityCtor,
  idFieldOrOptions: string | MapperTableOptions = "id",
): ClassDecorator {
  return (ctor) => {
    const Ctor = ctor as unknown as Ctor;
    const { tableName, options } = resolveMapperBinding(
      tableOrEntity,
      idFieldOrOptions,
    );

    if (typeof tableOrEntity !== "string") {
      Reflect.defineMetadata(MAPPER_ENTITY_KEY, tableOrEntity, ctor);
    }

    for (const method of MAPPER_DELEGATE_METHODS) {
      (Ctor as any).prototype[method] = function (...args: unknown[]) {
        const mapper = table(tableName, options) as BaseMapper;
        const fn = (mapper as any)[method];
        if (typeof fn !== "function") {
          throw new Error(`[Mapper] 缺少方法: ${method}`);
        }
        return fn.apply(mapper, args);
      };
    }

    Container.bindClass(Ctor);
  };
}
