import "reflect-metadata";
import { AsyncLocalStorage } from "node:async_hooks";
import type { Request, Response } from "express";
import type { RouteOption } from "./types";

const METHOD_ADVICES_KEY = Symbol.for("pangza.aop.methodAdvices");
const ADVISED_FLAG = Symbol.for("pangza.aop.advised");

/** 当前 HTTP 调用上下文（Controller 管线内由 mountRoute 注入） */
export interface MethodInvocationContext {
  req?: Request;
  res?: Response;
  option?: RouteOption;
  /** 路由路径（若有） */
  path?: string;
  /** HTTP 方法（若有） */
  httpMethod?: string;
  controllerName?: string;
  handlerName?: string;
}

/**
 * 方法调用连接点（对齐 Spring ProceedingJoinPoint）。
 * - 修改 `args` 可影响后续 Advice / 原方法
 * - 必须调用 `proceed()`（或自行短路返回）才会继续链
 */
export interface MethodInvocation {
  target: object;
  methodName: string;
  args: unknown[];
  /** HTTP 场景下有值；纯 Service 调用可能为空 */
  context?: MethodInvocationContext;
  proceed: () => Promise<unknown>;
}

/** Around：完整包裹；order 越小越靠外（优先级越高，对齐 Spring Ordered） */
export type AroundAdvice = (
  invocation: MethodInvocation
) => unknown | Promise<unknown>;

export type BeforeAdvice = (
  invocation: Omit<MethodInvocation, "proceed">
) => void | Promise<void>;

export type AfterReturningAdvice = (
  invocation: Omit<MethodInvocation, "proceed">,
  result: unknown
) => unknown | void | Promise<unknown | void>;

export type AfterThrowingAdvice = (
  invocation: Omit<MethodInvocation, "proceed">,
  error: unknown
) => void | Promise<void>;

export type AfterAdvice = (
  invocation: Omit<MethodInvocation, "proceed">,
  error?: unknown
) => void | Promise<void>;

export interface AdviceOptions {
  /** 越小越靠外，默认 0 */
  order?: number;
}

interface AdviceEntry {
  kind: "around" | "before" | "afterReturning" | "afterThrowing" | "after";
  order: number;
  around?: AroundAdvice;
  before?: BeforeAdvice;
  afterReturning?: AfterReturningAdvice;
  afterThrowing?: AfterThrowingAdvice;
  after?: AfterAdvice;
}

const invocationAls = new AsyncLocalStorage<MethodInvocationContext>();

/** 读取当前请求管线注入的调用上下文（非 HTTP 调用则为 undefined） */
export function getMethodInvocationContext():
  | MethodInvocationContext
  | undefined {
  return invocationAls.getStore();
}

/** 供 Application.mountRoute 包裹业务回调 */
export function runWithMethodInvocationContext<T>(
  ctx: MethodInvocationContext,
  fn: () => T | Promise<T>
): T | Promise<T> {
  return invocationAls.run(ctx, fn);
}

function getAdviceMap(
  ctor: Function
): Record<string, AdviceEntry[]> {
  return (
    (Reflect.getMetadata(METHOD_ADVICES_KEY, ctor) as
      | Record<string, AdviceEntry[]>
      | undefined) ?? {}
  );
}

function setAdviceMap(
  ctor: Function,
  map: Record<string, AdviceEntry[]>
): void {
  Reflect.defineMetadata(METHOD_ADVICES_KEY, map, ctor);
}

function addAdvice(
  ctor: Function,
  methodName: string,
  entry: AdviceEntry
): void {
  const map = { ...getAdviceMap(ctor) };
  const list = map[methodName] ? [...map[methodName]!] : [];
  list.push(entry);
  map[methodName] = list;
  setAdviceMap(ctor, map);
}

export function getMethodAdvices(
  ctor: Function,
  methodName: string
): readonly AdviceEntry[] {
  return getAdviceMap(ctor)[methodName] ?? [];
}

function sortEntries(entries: AdviceEntry[]): AdviceEntry[] {
  return [...entries].sort((a, b) => a.order - b.order);
}

/**
 * 将元数据中的 Before/After* 折成 Around，再按 order 串链执行。
 */
export async function runAdviceChain(
  original: (...args: unknown[]) => unknown,
  target: object,
  methodName: string,
  args: unknown[],
  entries: readonly AdviceEntry[],
  context?: MethodInvocationContext
): Promise<unknown> {
  if (!entries.length) {
    return original.apply(target, args);
  }

  const sorted = sortEntries(entries as AdviceEntry[]);
  const aroundList: AroundAdvice[] = sorted.map((e) => toAround(e));

  let index = 0;
  const invocation: MethodInvocation = {
    target,
    methodName,
    args,
    context: context ?? getMethodInvocationContext(),
    proceed: async () => {
      if (index < aroundList.length) {
        const advice = aroundList[index++]!;
        return advice(invocation);
      }
      return original.apply(target, invocation.args);
    },
  };
  return invocation.proceed();
}

function toAround(entry: AdviceEntry): AroundAdvice {
  if (entry.kind === "around" && entry.around) {
    return entry.around;
  }
  if (entry.kind === "before" && entry.before) {
    const before = entry.before;
    return async (inv) => {
      await before(inv);
      return inv.proceed();
    };
  }
  if (entry.kind === "afterReturning" && entry.afterReturning) {
    const afterReturning = entry.afterReturning;
    return async (inv) => {
      const result = await inv.proceed();
      const out = await afterReturning(inv, result);
      return out === undefined ? result : out;
    };
  }
  if (entry.kind === "afterThrowing" && entry.afterThrowing) {
    const afterThrowing = entry.afterThrowing;
    return async (inv) => {
      try {
        return await inv.proceed();
      } catch (err) {
        await afterThrowing(inv, err);
        throw err;
      }
    };
  }
  if (entry.kind === "after" && entry.after) {
    const after = entry.after;
    return async (inv) => {
      let error: unknown;
      try {
        return await inv.proceed();
      } catch (err) {
        error = err;
        throw err;
      } finally {
        await after(inv, error);
      }
    };
  }
  return (inv) => inv.proceed();
}

type AnyMethod = (...args: unknown[]) => unknown;

function ensureAdvised(
  target: object,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor
): void {
  const original = descriptor.value as AnyMethod | undefined;
  if (typeof original !== "function") return;
  if ((original as AnyMethod & { [ADVISED_FLAG]?: boolean })[ADVISED_FLAG]) {
    return;
  }

  const methodName = String(propertyKey);
  const advised: AnyMethod = async function (
    this: object,
    ...args: unknown[]
  ) {
    const ctor = (this as { constructor: Function }).constructor;
    const entries = resolveMethodAdviceEntries(ctor, methodName);
    return runAdviceChain(
      original,
      this,
      methodName,
      args,
      entries,
      getMethodInvocationContext()
    );
  };
  (advised as AnyMethod & { [ADVISED_FLAG]?: boolean })[ADVISED_FLAG] = true;
  descriptor.value = advised;
}

function createAdviceDecorator(
  entry: Omit<AdviceEntry, "order"> & { order?: number }
): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    if (!descriptor || typeof descriptor.value !== "function") {
      return descriptor;
    }
    const ctor = (target as object).constructor;
    addAdvice(ctor, String(propertyKey), {
      ...entry,
      order: entry.order ?? 0,
    } as AdviceEntry);
    ensureAdvised(target as object, propertyKey, descriptor);
    return descriptor;
  };
}

/**
 * 创建 Around 装饰器（自定义注解的推荐入口）。
 *
 * @example
 * export const Audit = (title: string) =>
 *   createAroundDecorator(async (inv) => {
 *     console.log("audit", title, inv.methodName, inv.context?.req?.path);
 *     return inv.proceed();
 *   }, { order: 100 });
 *
 * // 使用
 * @PostMapping("/save")
 * @Audit("保存用户")
 * save(@RequestBody() body: User) { ... }
 */
export function createAroundDecorator(
  advice: AroundAdvice,
  options: AdviceOptions = {}
): MethodDecorator {
  return createAdviceDecorator({
    kind: "around",
    around: advice,
    order: options.order,
  });
}

/** 直接使用的 Around 方法装饰器 */
export function Around(
  advice: AroundAdvice,
  options: AdviceOptions = {}
): MethodDecorator {
  return createAroundDecorator(advice, options);
}

export function createBeforeDecorator(
  advice: BeforeAdvice,
  options: AdviceOptions = {}
): MethodDecorator {
  return createAdviceDecorator({
    kind: "before",
    before: advice,
    order: options.order,
  });
}

export function Before(
  advice: BeforeAdvice,
  options: AdviceOptions = {}
): MethodDecorator {
  return createBeforeDecorator(advice, options);
}

export function createAfterReturningDecorator(
  advice: AfterReturningAdvice,
  options: AdviceOptions = {}
): MethodDecorator {
  return createAdviceDecorator({
    kind: "afterReturning",
    afterReturning: advice,
    order: options.order,
  });
}

export function AfterReturning(
  advice: AfterReturningAdvice,
  options: AdviceOptions = {}
): MethodDecorator {
  return createAfterReturningDecorator(advice, options);
}

export function createAfterThrowingDecorator(
  advice: AfterThrowingAdvice,
  options: AdviceOptions = {}
): MethodDecorator {
  return createAdviceDecorator({
    kind: "afterThrowing",
    afterThrowing: advice,
    order: options.order,
  });
}

export function AfterThrowing(
  advice: AfterThrowingAdvice,
  options: AdviceOptions = {}
): MethodDecorator {
  return createAfterThrowingDecorator(advice, options);
}

export function createAfterDecorator(
  advice: AfterAdvice,
  options: AdviceOptions = {}
): MethodDecorator {
  return createAdviceDecorator({
    kind: "after",
    after: advice,
    order: options.order,
  });
}

export function After(
  advice: AfterAdvice,
  options: AdviceOptions = {}
): MethodDecorator {
  return createAfterDecorator(advice, options);
}

/**
 * 按「注解标记」注册全局 Around：先用 `markAdvice(key)` 标方法，再 `registerAroundAdvice(key, fn)`。
 * 更接近 Spring `@Around("@annotation(...)")`；注册与标记顺序无关（运行时合并）。
 */
const MARKER_ADVICES = new Map<
  string | symbol,
  { advice: AroundAdvice; order: number }
>();

const METHOD_MARKERS_KEY = Symbol.for("pangza.aop.methodMarkers");

function getMethodMarkers(
  ctor: Function,
  methodName: string
): Array<string | symbol> {
  const map =
    (Reflect.getMetadata(METHOD_MARKERS_KEY, ctor) as
      | Record<string, Array<string | symbol>>
      | undefined) ?? {};
  return map[methodName] ?? [];
}

/** 本地 Advice + marker 全局 Advice */
function resolveMethodAdviceEntries(
  ctor: Function,
  methodName: string
): AdviceEntry[] {
  const local = [...getMethodAdvices(ctor, methodName)];
  for (const key of getMethodMarkers(ctor, methodName)) {
    const reg = MARKER_ADVICES.get(key);
    if (!reg) continue;
    local.push({
      kind: "around",
      around: reg.advice,
      order: reg.order,
    });
  }
  return local;
}

export function markAdvice(key: string | symbol): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    if (!descriptor || typeof descriptor.value !== "function") {
      return descriptor;
    }
    const ctor = (target as object).constructor;
    const methodName = String(propertyKey);
    const map =
      (Reflect.getMetadata(METHOD_MARKERS_KEY, ctor) as
        | Record<string, Array<string | symbol>>
        | undefined) ?? {};
    const list = map[methodName] ? [...map[methodName]!] : [];
    if (!list.includes(key)) list.push(key);
    map[methodName] = list;
    Reflect.defineMetadata(METHOD_MARKERS_KEY, map, ctor);
    ensureAdvised(target as object, propertyKey, descriptor);
    return descriptor;
  };
}

/**
 * 为 `markAdvice(key)` 注册切面（可在标记之前或之后调用）。
 */
export function registerAroundAdvice(
  key: string | symbol,
  advice: AroundAdvice,
  options: AdviceOptions = {}
): void {
  MARKER_ADVICES.set(key, { advice, order: options.order ?? 0 });
}

/** 创建「标记装饰器」：等价于固定 key 的 markAdvice */
export function createMarkDecorator(
  key: string | symbol
): () => MethodDecorator {
  return () => markAdvice(key);
}
