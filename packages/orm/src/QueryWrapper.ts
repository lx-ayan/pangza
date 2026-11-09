import type { SqlFragment } from "./types";
import {
  assertIdent,
  assertSafeLastSql,
  escapeLike,
} from "./security";
import { getDialect, type Dialect, type DbType } from "./dialect";

export { assertIdent } from "./security";

type JoinType = "AND" | "OR";

interface Condition {
  join: JoinType;
  sql: string;
  params: unknown[];
}

interface HavingClause {
  sql: string;
  params: unknown[];
}

export interface QueryWrapperOptions {
  /**
   * 方言或数据库类型（一般不用传）。
   * 省略时读 `datasource.default.type`（经 Db 默认数据源）；未配置则 mysql。
   * 多数据源场景才需要显式指定或用 `QueryWrapper.forDatasource(name)`。
   */
  dialect?: Dialect | DbType | string;
}

/** 把已拼进条件里的标识符引号改写成目标方言（跨库复用 Wrapper） */
function rewriteIdentQuotes(sql: string, from: Dialect, to: Dialect): string {
  if (from.type === to.type) return sql;
  let out = sql;
  if (from.type === "mysql") {
    out = out.replace(/`([^`]+)`/g, (_m, id: string) => to.quoteIdent(id));
  } else if (from.type === "postgresql") {
    out = out.replace(/"([^"]+)"/g, (_m, id: string) => to.quoteIdent(id));
  } else if (from.type === "sqlserver") {
    out = out.replace(/\[([^\]]+)\]/g, (_m, id: string) => to.quoteIdent(id));
  }
  const fromEsc = from.likeEscapeClause();
  const toEsc = to.likeEscapeClause();
  if (fromEsc !== toEsc && out.includes("ESCAPE")) {
    // 仅替换尾部 ESCAPE 子句，避免误伤列名
    out = out.split(fromEsc).join(toEsc);
  }
  // LIKE 左侧：对齐目标方言的文本转换（PG uuid::text 等）
  if (/\sLIKE\s/i.test(out) || /\sNOT\s+LIKE\s/i.test(out)) {
    out = rewriteLikeLeft(out, from, to);
  }
  return out;
}

/** 把 `col LIKE` / `(col)::text LIKE` / `CONVERT(... ) LIKE` 改成目标方言形式 */
function rewriteLikeLeft(sql: string, from: Dialect, to: Dialect): string {
  let out = sql;
  // 先剥掉源方言的 LIKE 左侧包装，还原为 quoteIdent 形式
  if (from.type === "postgresql") {
    out = out.replace(
      /\((\s*"[^"]+"\s*)\)::text(\s+(?:NOT\s+)?LIKE\s+)/gi,
      "$1$2"
    );
  } else if (from.type === "sqlserver") {
    out = out.replace(
      /CONVERT\s*\(\s*VARCHAR\s*\(\s*MAX\s*\)\s*,\s*(\[[^\]]+\])\s*\)(\s+(?:NOT\s+)?LIKE\s+)/gi,
      "$1$2"
    );
  }
  if (to.type === from.type) return out;
  // 再套上目标方言包装（已是 quoteIdent + LIKE）
  if (to.type === "postgresql") {
    out = out.replace(
      /("([^"]+)")(\s+(?:NOT\s+)?LIKE\s+)/gi,
      (_m: string, quoted: string, _id: string, likePart: string) =>
        `${to.likeLeftExpr(quoted)}${likePart}`
    );
  } else if (to.type === "sqlserver") {
    out = out.replace(
      /(\[([^\]]+)\])(\s+(?:NOT\s+)?LIKE\s+)/gi,
      (_m: string, quoted: string, _id: string, likePart: string) =>
        `${to.likeLeftExpr(quoted)}${likePart}`
    );
  }
  return out;
}

/**
 * 默认方言：优先 Db 默认数据源（= application.yaml datasource.default），
 * 其次直接读 mysqlConfig.type（该对象实际是 default 数据源配置），最后 mysql。
 */
function resolveDefaultDialect(): Dialect {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Db = require("./Db").default as {
      getDialect: (n?: string) => Dialect;
    };
    return Db.getDialect();
  } catch {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { mysqlConfig } = require("@pangza/core/config") as {
        mysqlConfig: { type?: string };
      };
      return getDialect(mysqlConfig?.type || "mysql");
    } catch {
      return getDialect("mysql");
    }
  }
}

function resolveInBatchSize(): number {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getOrmConfig } = require("./config") as {
      getOrmConfig: () => { batchInSize?: number };
    };
    const n = Number(getOrmConfig().batchInSize ?? 500);
    return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 500;
  } catch {
    return 500;
  }
}

/**
 * 条件构造器（对齐 MyBatis-Plus QueryWrapper 常用 API）。
 * 列名白名单校验，值一律参数绑定。
 *
 * 方言自动跟随 `datasource.default.type`（未配置则 mysql），业务侧换库只改 YAML，
 * 不必改 `eq` / `like` 等调用。LIKE 在 PG/MSSQL 上会自动转文本（兼容 uuid 列）。
 *
 * @example
 * // 推荐：不写库类型
 * new QueryWrapper().eq("status", 1).like("name", "zhang")
 *
 * // 多数据源才指定
 * QueryWrapper.forDatasource("postgresql").eq("status", 1)
 */
export class QueryWrapper {
  private conditions: Condition[] = [];
  private orders: string[] = [];
  private selectColumns: string[] = [];
  private groupColumns: string[] = [];
  private havingClauses: HavingClause[] = [];
  private lastSqlText = "";
  private nextJoin: JoinType = "AND";
  private skipLogicDelete = false;
  private dialect: Dialect;

  constructor(options?: QueryWrapperOptions | Dialect | DbType | string) {
    if (!options) {
      this.dialect = resolveDefaultDialect();
    } else if (typeof options === "string") {
      this.dialect = getDialect(options);
    } else if (typeof options === "object" && "quoteIdent" in options) {
      this.dialect = options as Dialect;
    } else {
      const d = (options as QueryWrapperOptions).dialect;
      if (d && typeof d === "object" && "quoteIdent" in d) {
        this.dialect = d as Dialect;
      } else if (d) {
        this.dialect = getDialect(d as DbType | string);
      } else {
        this.dialect = resolveDefaultDialect();
      }
    }
  }

  getDialect(): Dialect {
    return this.dialect;
  }

  /**
   * 切换方言并改写已缓存条件中的引号 / LIKE ESCAPE。
   * BaseMapper 在 Wrapper 方言与数据源不一致时会调用，避免 PG 上出现 MySQL 反引号。
   */
  rebaseDialect(dialect: Dialect | DbType | string): this {
    const next =
      typeof dialect === "object" && dialect && "quoteIdent" in dialect
        ? (dialect as Dialect)
        : getDialect(dialect as DbType | string);
    if (next.type === this.dialect.type) {
      return this;
    }
    const from = this.dialect;
    for (const c of this.conditions) {
      c.sql = rewriteIdentQuotes(c.sql, from, next);
    }
    this.orders = this.orders.map((o) => rewriteIdentQuotes(o, from, next));
    this.selectColumns = this.selectColumns.map((c) =>
      rewriteIdentQuotes(c, from, next)
    );
    this.groupColumns = this.groupColumns.map((c) =>
      rewriteIdentQuotes(c, from, next)
    );
    for (const h of this.havingClauses) {
      h.sql = rewriteIdentQuotes(h.sql, from, next);
    }
    this.dialect = next;
    return this;
  }

  /** 本条查询忽略逻辑删除条件（查回收站等） */
  ignoreLogicDelete(): this {
    this.skipLogicDelete = true;
    return this;
  }

  isIgnoreLogicDelete(): boolean {
    return this.skipLogicDelete;
  }

  /** 复制一份，避免 Mapper 追加逻辑删除时改到调用方 */
  clone(): QueryWrapper {
    const copy = new QueryWrapper(this.dialect);
    (copy as unknown as { conditions: Condition[] }).conditions =
      this.conditions.map((c) => ({
        join: c.join,
        sql: c.sql,
        params: [...c.params],
      }));
    (copy as unknown as { orders: string[] }).orders = [...this.orders];
    (copy as unknown as { selectColumns: string[] }).selectColumns = [
      ...this.selectColumns,
    ];
    (copy as unknown as { groupColumns: string[] }).groupColumns = [
      ...this.groupColumns,
    ];
    (copy as unknown as { havingClauses: HavingClause[] }).havingClauses =
      this.havingClauses.map((h) => ({
        sql: h.sql,
        params: [...h.params],
      }));
    (copy as unknown as { lastSqlText: string }).lastSqlText = this.lastSqlText;
    (copy as unknown as { nextJoin: JoinType }).nextJoin = this.nextJoin;
    copy.skipLogicDelete = this.skipLogicDelete;
    return copy;
  }

  /** 下一条件用 OR 连接 */
  or(): this {
    this.nextJoin = "OR";
    return this;
  }

  /** 下一条件用 AND 连接（默认） */
  and(): this {
    this.nextJoin = "AND";
    return this;
  }

  private add(sql: string, params: unknown[] = []): this {
    this.conditions.push({
      join: this.nextJoin,
      sql,
      params,
    });
    this.nextJoin = "AND";
    return this;
  }

  private col(column: string): string {
    return this.dialect.quoteIdent(assertIdent(column));
  }

  /**
   * 指定查询列；不传则默认 SELECT *
   * @example wrapper.select('id', 'username', 'status')
   */
  select(...columns: string[]): this {
    if (columns.length === 0) {
      this.selectColumns = [];
      return this;
    }
    this.selectColumns = columns.map((c) => this.col(c));
    return this;
  }

  eq(column: string, value: unknown): this {
    return this.add(`${this.col(column)} = ?`, [value]);
  }

  /** field = value OR field IS NULL（兼容历史未填逻辑删除字段的数据） */
  eqOrIsNull(column: string, value: unknown): this {
    const c = this.col(column);
    return this.add(`(${c} = ? OR ${c} IS NULL)`, [value]);
  }

  ne(column: string, value: unknown): this {
    return this.add(`${this.col(column)} <> ?`, [value]);
  }

  gt(column: string, value: unknown): this {
    return this.add(`${this.col(column)} > ?`, [value]);
  }

  ge(column: string, value: unknown): this {
    return this.add(`${this.col(column)} >= ?`, [value]);
  }

  lt(column: string, value: unknown): this {
    return this.add(`${this.col(column)} < ?`, [value]);
  }

  le(column: string, value: unknown): this {
    return this.add(`${this.col(column)} <= ?`, [value]);
  }

  private likePattern(column: string, pattern: string, not = false): this {
    const op = not ? "NOT LIKE" : "LIKE";
    // PG/MSSQL：uuid、int 等非文本列需先转文本，否则 uuid ~~ text 报错
    const left = this.dialect.likeLeftExpr(this.col(column));
    return this.add(
      `${left} ${op} ?${this.dialect.likeEscapeClause()}`,
      [pattern]
    );
  }

  /**
   * 模糊查询；已转义 % / _，避免通配符注入。
   * PostgreSQL 下自动 `col::text LIKE`，uuid 列可直接 like。
   */
  like(column: string, value: string): this {
    return this.likePattern(column, `%${escapeLike(String(value))}%`);
  }

  /** 左模糊：`%value`（对齐 MP likeLeft） */
  likeLeft(column: string, value: string): this {
    return this.likePattern(column, `%${escapeLike(String(value))}`);
  }

  /** 右模糊：`value%`（对齐 MP likeRight） */
  likeRight(column: string, value: string): this {
    return this.likePattern(column, `${escapeLike(String(value))}%`);
  }

  /** `NOT LIKE %value%`（已转义通配符） */
  notLike(column: string, value: string): this {
    return this.likePattern(column, `%${escapeLike(String(value))}%`, true);
  }

  /**
   * EXISTS (子查询)。子查询自行保证安全；参数走绑定。
   * @example wrapper.exists('SELECT 1 FROM role_user ru WHERE ru.user_id = t.id AND ru.role_id = ?', [1])
   */
  exists(sql: string, params: unknown[] = []): this {
    const body = String(sql).trim();
    if (!body) throw new Error("exists() 子查询不能为空");
    return this.add(`EXISTS (${body})`, params);
  }

  /** NOT EXISTS (子查询) */
  notExists(sql: string, params: unknown[] = []): this {
    const body = String(sql).trim();
    if (!body) throw new Error("notExists() 子查询不能为空");
    return this.add(`NOT EXISTS (${body})`, params);
  }

  /**
   * 追加自定义条件片段（参数绑定）。
   * 仅用于无法用 eq/like 表达的括号 OR 等场景；列名须自行保证安全。
   */
  apply(sql: string, params: unknown[] = []): this {
    return this.add(`(${sql})`, params);
  }

  /** 括号分组：fn 内条件作为整体与外层 AND/OR 连接（内层沿用本 Wrapper 方言） */
  nested(fn: (w: QueryWrapper) => void): this {
    const inner = new QueryWrapper(this.dialect);
    fn(inner);
    const frag = inner.build();
    if (!frag.whereSql) return this;
    const body = frag.whereSql.replace(/^WHERE\s+/i, "");
    return this.add(`(${body})`, frag.params);
  }

  /** 大数组按 batchInSize 拆成多个 IN，用 OR / AND 连接 */
  private inChunks(
    column: string,
    values: unknown[],
    not: boolean
  ): this {
    const col = this.col(column);
    const chunkSize = resolveInBatchSize();
    const op = not ? "NOT IN" : "IN";
    const join = not ? " AND " : " OR ";
    if (values.length <= chunkSize) {
      const placeholders = values.map(() => "?").join(", ");
      return this.add(`${col} ${op} (${placeholders})`, values);
    }
    const parts: string[] = [];
    const params: unknown[] = [];
    for (let i = 0; i < values.length; i += chunkSize) {
      const chunk = values.slice(i, i + chunkSize);
      parts.push(`${col} ${op} (${chunk.map(() => "?").join(", ")})`);
      params.push(...chunk);
    }
    return this.add(`(${parts.join(join)})`, params);
  }

  in(column: string, values: unknown[]): this {
    if (!Array.isArray(values)) {
      throw new Error("in() 参数必须是数组");
    }
    if (!values.length) {
      return this.add("1 = 0");
    }
    return this.inChunks(column, values, false);
  }

  /** `NOT IN (...)`；空数组视为永真（不加限制），与 in([]) 永假对称 */
  notIn(column: string, values: unknown[]): this {
    if (!Array.isArray(values)) {
      throw new Error("notIn() 参数必须是数组");
    }
    if (!values.length) {
      return this.add("1 = 1");
    }
    return this.inChunks(column, values, true);
  }

  between(column: string, start: unknown, end: unknown): this {
    return this.add(`${this.col(column)} BETWEEN ? AND ?`, [start, end]);
  }

  notBetween(column: string, start: unknown, end: unknown): this {
    return this.add(`${this.col(column)} NOT BETWEEN ? AND ?`, [start, end]);
  }

  /**
   * 按已注册数据源方言创建 Wrapper（多数据源时用；单库直接 `new QueryWrapper()` 即可）。
   * @example QueryWrapper.forDatasource("report").eq("status", 1)
   */
  static forDatasource(name = "default"): QueryWrapper {
    // 延迟加载，避免与 Db 循环依赖
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Db = require("./Db").default as {
      getDialect: (n?: string) => Dialect;
    };
    return new QueryWrapper(Db.getDialect(name));
  }

  isNull(column: string): this {
    return this.add(`${this.col(column)} IS NULL`);
  }

  isNotNull(column: string): this {
    return this.add(`${this.col(column)} IS NOT NULL`);
  }

  orderByAsc(column: string): this {
    this.orders.push(`${this.col(column)} ASC`);
    return this;
  }

  orderByDesc(column: string): this {
    this.orders.push(`${this.col(column)} DESC`);
    return this;
  }

  /**
   * GROUP BY 列（白名单标识符）。可多次调用追加。
   * @example wrapper.select("status").groupBy("status")
   */
  groupBy(...columns: string[]): this {
    for (const c of columns) {
      this.groupColumns.push(this.col(c));
    }
    return this;
  }

  /**
   * HAVING 条件（参数绑定）。可多次调用，以 AND 连接。
   * 聚合表达式由调用方书写，列名请自行保证安全。
   * @example wrapper.groupBy("status").having("COUNT(*) > ?", [1])
   */
  having(sql: string, params: unknown[] = []): this {
    const body = String(sql).trim();
    if (!body) throw new Error("having() 条件不能为空");
    this.havingClauses.push({ sql: body, params: [...params] });
    return this;
  }

  /**
   * 追加安全白名单片段（禁止任意 SQL）。
   * 仅允许：LIMIT n [OFFSET m] / FOR UPDATE / LOCK IN SHARE MODE
   */
  last(sql: string): this {
    this.lastSqlText = assertSafeLastSql(sql);
    return this;
  }

  /** 生成 SELECT / WHERE / GROUP BY / HAVING / ORDER BY / LAST 片段 */
  build(): SqlFragment {
    const params: unknown[] = [];
    let whereSql = "";

    if (this.conditions.length > 0) {
      const parts: string[] = [];
      this.conditions.forEach((c, index) => {
        if (index === 0) {
          parts.push(c.sql);
        } else {
          parts.push(`${c.join} ${c.sql}`);
        }
        params.push(...c.params);
      });
      whereSql = `WHERE ${parts.join(" ")}`;
    }

    const groupSql =
      this.groupColumns.length > 0
        ? `GROUP BY ${this.groupColumns.join(", ")}`
        : "";

    let havingSql = "";
    if (this.havingClauses.length > 0) {
      const parts = this.havingClauses.map((h) => {
        params.push(...h.params);
        return h.sql;
      });
      havingSql = `HAVING ${parts.join(" AND ")}`;
    }

    const orderSql =
      this.orders.length > 0 ? `ORDER BY ${this.orders.join(", ")}` : "";

    return {
      selectSql:
        this.selectColumns.length > 0 ? this.selectColumns.join(", ") : "*",
      whereSql,
      groupSql,
      havingSql,
      orderSql,
      lastSql: this.lastSqlText,
      params,
    };
  }
}
