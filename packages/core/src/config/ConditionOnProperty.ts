import { Container, type Ctor } from "../Service/container";

const PREFIX_KEY = Symbol.for("pangza.conditionOnProperty.prefix");
const OPTIONS_KEY = Symbol.for("pangza.conditionOnProperty.options");
const APPLIED_KEY = Symbol.for("pangza.conditionOnProperty.applied");

export type ConditionOnPropertyOptions = {
  /** YAML 前缀，如 "redis" → redis.host */
  prefix: string;
  /**
   * 装饰器级默认值：仅当属性自身没有初始值、且 YAML 也没有时使用。
   */
  defaults?: Record<string, unknown>;
};

function normalizePrefix(prefix: string): string {
  return String(prefix || "")
    .trim()
    .replace(/^\.+|\.+$/g, "");
}

function readYaml(path: string): unknown {
  // 懒加载，避免与 config/index 循环依赖
  const { getConfigValue } = require("./index") as typeof import("./index");
  return getConfigValue(path, undefined);
}

/**
 * 是否「类上自己定义了默认值」：构造后属性不是 undefined。
 * 有默认值 → 保留（优先自己定义的默认值），不读 YAML。
 * 无默认值（如 `port!: number`）→ 从 YAML 前缀路径填充。
 */
export function applyConditionOnProperty(
  ctor: Function,
  instance: object
): void {
  const prefix = Reflect.getMetadata(PREFIX_KEY, ctor) as string | undefined;
  if (!prefix) return;

  const bag = instance as Record<string | symbol, unknown>;
  if (bag[APPLIED_KEY]) return;
  bag[APPLIED_KEY] = true;

  const options = Reflect.getMetadata(OPTIONS_KEY, ctor) as
    | ConditionOnPropertyOptions
    | undefined;
  const defaults = options?.defaults ?? {};

  const keys = new Set<string>([
    ...Object.keys(instance),
    ...Object.keys(defaults),
  ]);

  for (const key of keys) {
    if (key === "constructor") continue;
    const own = (instance as Record<string, unknown>)[key];
    if (own !== undefined) {
      continue;
    }
    const fromYaml = readYaml(`${prefix}.${key}`);
    if (fromYaml !== undefined) {
      (instance as Record<string, unknown>)[key] = fromYaml;
      continue;
    }
    if (Object.prototype.hasOwnProperty.call(defaults, key)) {
      (instance as Record<string, unknown>)[key] = defaults[key];
    }
  }
}

/**
 * 类装饰器：按 YAML 前缀自动注入属性。
 *
 * - 标注前缀后，`prefix.属性名` 对应 application*.yaml
 * - **优先自己定义的默认值**（字段初始值）；未设默认值时才读 YAML
 * - `defaults` 选项作为 YAML 也缺失时的回退
 *
 * @example
 * @ConditionOnProperty("redis")
 * class RedisSettings {
 *   host = "127.0.0.1"; // 有默认值 → 用该值，忽略 yaml
 *   port!: number;      // 无默认值 → 读 redis.port
 * }
 *
 * @ConditionOnProperty({ prefix: "server", defaults: { port: 3990 } })
 * class ServerSettings {
 *   port!: number;
 * }
 */
export function ConditionOnProperty(
  prefixOrOptions: string | ConditionOnPropertyOptions
): ClassDecorator {
  const options: ConditionOnPropertyOptions =
    typeof prefixOrOptions === "string"
      ? { prefix: prefixOrOptions }
      : { ...prefixOrOptions };

  const prefix = normalizePrefix(options.prefix);
  if (!prefix) {
    throw new Error("@ConditionOnProperty 前缀不能为空");
  }

  return (ctor) => {
    const Ctor = ctor as unknown as Ctor;
    Reflect.defineMetadata(PREFIX_KEY, prefix, ctor);
    Reflect.defineMetadata(OPTIONS_KEY, { ...options, prefix }, ctor);

    Container.bindClassWithActivation(Ctor, (instance) => {
      applyConditionOnProperty(ctor, instance);
      return instance;
    });
  };
}

export function getConditionOnPropertyPrefix(
  ctor: Function
): string | undefined {
  return Reflect.getMetadata(PREFIX_KEY, ctor) as string | undefined;
}
