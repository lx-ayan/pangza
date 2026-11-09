import "reflect-metadata";
import type { Request, Response } from "express";
import type { RouteOption } from "./types";
import { matchPathPatterns } from "./pathMatch";

export const HANDLER_INTERCEPTOR_KEY = Symbol.for(
  "pangza.handlerInterceptor.options"
);

/** 请求前拦截上下文（鉴权 / 限流之后、Controller 之前） */
export interface RequestInterceptorContext {
  req: Request;
  res: Response;
  option?: RouteOption;
  /**
   * 设为 true：跳过 Controller。
   * 可同时设置 `data`，交给响应拦截器 / 默认 ResponseData。
   * 也可自行 `res.send` 后设 `handled`（见下，与 response 侧一致时用 response.headersSent 判断）。
   */
  skipHandler?: boolean;
  /** 与 skipHandler 配合：作为后续响应拦截的业务数据 */
  data?: unknown;
}

/** 响应前拦截上下文（Controller 之后、写出响应之前） */
export interface ResponseInterceptorContext {
  req: Request;
  res: Response;
  option?: RouteOption;
  /** Controller 返回值（或请求拦截 skipHandler 时带入的 data） */
  data: unknown;
  /**
   * 默认 true：`ResponseData.success(data)`。
   * 设为 false：直接 `res.send(data)`，便于自定义外层结构。
   */
  wrap: boolean;
  /**
   * 设为 true（或已 headersSent）：框架不再写响应。
   * 用于拦截器内自行 `res.json` / `res.send`。
   */
  handled: boolean;
}

export type RequestInterceptor = (
  ctx: RequestInterceptorContext
) => void | Promise<void>;

/**
 * 响应拦截器。
 * - 返回值非 `undefined` 时替换 `ctx.data`
 * - 改 `ctx.wrap = false` 可跳过 ResponseData 包装
 * - 自行写响应后设 `ctx.handled = true`
 */
export type ResponseInterceptor = (
  ctx: ResponseInterceptorContext
) => unknown | void | Promise<unknown | void>;

/**
 * 当前命中的处理器信息（对齐 Spring HandlerInterceptor 的 handler 参数）。
 */
export interface HandlerInfo {
  path: string;
  method: string;
  controllerName?: string;
  handlerName?: string;
  option?: RouteOption;
}

/**
 * Spring MVC HandlerInterceptor：
 * - preHandle：Controller 前；返回 false 中止（可自行写响应）
 * - postHandle：Controller 后、写出前；返回值非 undefined 时替换业务数据
 * - afterCompletion：请求结束（含异常），在 finally 中调用
 */
export interface HandlerInterceptor {
  preHandle?(
    req: Request,
    res: Response,
    handler: HandlerInfo
  ): boolean | void | Promise<boolean | void>;
  postHandle?(
    req: Request,
    res: Response,
    handler: HandlerInfo,
    data: unknown
  ): unknown | void | Promise<unknown | void>;
  afterCompletion?(
    req: Request,
    res: Response,
    handler: HandlerInfo,
    error?: unknown
  ): void | Promise<void>;
}

/** @Interceptor / addInterceptor 注册选项 */
export interface InterceptorOptions {
  /** 越小越靠前，默认 0 */
  order?: number;
  /** 生效路径，默认 `["/**"]` */
  include?: string[];
  /** 排除路径 */
  exclude?: string[];
}

export interface InterceptorRegistration {
  interceptor: HandlerInterceptor;
  order: number;
  include: string[];
  exclude: string[];
}

const requestInterceptors: RequestInterceptor[] = [];
const responseInterceptors: ResponseInterceptor[] = [];
const handlerInterceptorRegs: InterceptorRegistration[] = [];

export function isHandlerInterceptor(
  bean: unknown
): bean is HandlerInterceptor {
  if (!bean || typeof bean !== "object") return false;
  const i = bean as HandlerInterceptor;
  return (
    typeof i.preHandle === "function" ||
    typeof i.postHandle === "function" ||
    typeof i.afterCompletion === "function"
  );
}

export function addRequestInterceptor(fn: RequestInterceptor): void {
  requestInterceptors.push(fn);
}

export function addResponseInterceptor(fn: ResponseInterceptor): void {
  responseInterceptors.push(fn);
}

export function addInterceptorRegistration(
  interceptor: HandlerInterceptor,
  options: InterceptorOptions = {}
): void {
  handlerInterceptorRegs.push({
    interceptor,
    order: options.order ?? 0,
    include: options.include?.length ? options.include : ["/**"],
    exclude: options.exclude ?? [],
  });
}

export function getHandlerInterceptorRegistrations(): readonly InterceptorRegistration[] {
  return handlerInterceptorRegs;
}

export function clearInterceptors(): void {
  requestInterceptors.length = 0;
  responseInterceptors.length = 0;
  handlerInterceptorRegs.length = 0;
}

export function getRequestInterceptors(): readonly RequestInterceptor[] {
  return requestInterceptors;
}

export function getResponseInterceptors(): readonly ResponseInterceptor[] {
  return responseInterceptors;
}

function sortedHandlerInterceptors(): InterceptorRegistration[] {
  return [...handlerInterceptorRegs].sort((a, b) => a.order - b.order);
}

function matchingInterceptors(path: string): InterceptorRegistration[] {
  return sortedHandlerInterceptors().filter((reg) =>
    matchPathPatterns(path, reg.include, reg.exclude)
  );
}

export async function runRequestInterceptors(
  req: Request,
  res: Response,
  option?: RouteOption
): Promise<RequestInterceptorContext> {
  const ctx: RequestInterceptorContext = { req, res, option };
  for (const fn of requestInterceptors) {
    await fn(ctx);
    if (ctx.skipHandler || res.headersSent) break;
  }
  return ctx;
}

export async function runResponseInterceptors(
  base: Omit<ResponseInterceptorContext, "wrap" | "handled"> &
    Partial<Pick<ResponseInterceptorContext, "wrap" | "handled">>
): Promise<ResponseInterceptorContext> {
  const ctx: ResponseInterceptorContext = {
    wrap: true,
    handled: false,
    ...base,
  };
  for (const fn of responseInterceptors) {
    const out = await fn(ctx);
    if (out !== undefined) {
      ctx.data = out;
    }
    if (ctx.handled || ctx.res.headersSent) {
      ctx.handled = true;
      break;
    }
  }
  if (ctx.res.headersSent) {
    ctx.handled = true;
  }
  return ctx;
}

/**
 * 跑 HandlerInterceptor.preHandle。
 * @returns false 表示应中止后续 Controller
 */
export async function runHandlerPreHandle(
  req: Request,
  res: Response,
  handler: HandlerInfo
): Promise<boolean> {
  for (const reg of matchingInterceptors(req.path)) {
    const fn = reg.interceptor.preHandle;
    if (!fn) continue;
    const ok = await fn(req, res, handler);
    if (ok === false || res.headersSent) return false;
  }
  return true;
}

/** 跑 HandlerInterceptor.postHandle；返回最终 data */
export async function runHandlerPostHandle(
  req: Request,
  res: Response,
  handler: HandlerInfo,
  data: unknown
): Promise<unknown> {
  let current = data;
  for (const reg of matchingInterceptors(req.path)) {
    const fn = reg.interceptor.postHandle;
    if (!fn) continue;
    const out = await fn(req, res, handler, current);
    if (out !== undefined) current = out;
    if (res.headersSent) break;
  }
  return current;
}

/** 跑 HandlerInterceptor.afterCompletion（逆序，对齐 Spring） */
export async function runHandlerAfterCompletion(
  req: Request,
  res: Response,
  handler: HandlerInfo,
  error?: unknown
): Promise<void> {
  const list = matchingInterceptors(req.path);
  for (let i = list.length - 1; i >= 0; i--) {
    const fn = list[i]!.interceptor.afterCompletion;
    if (!fn) continue;
    try {
      await fn(req, res, handler, error);
    } catch {
      // afterCompletion 失败不覆盖原错误
    }
  }
}

/**
 * 类装饰器：标记 HandlerInterceptor（类加载时自动注册）。
 *
 * @example
 * @Interceptor({ include: ["/api/**"], order: 0 })
 * class LogInterceptor implements HandlerInterceptor {
 *   preHandle(req) { console.log(req.method, req.path); return true; }
 * }
 */
export function Interceptor(options: InterceptorOptions = {}): ClassDecorator {
  return (ctor) => {
    const Ctor = ctor as unknown as new () => object;
    Reflect.defineMetadata(HANDLER_INTERCEPTOR_KEY, options, Ctor);
    const { default: Application } = require("./index") as {
      default: { registerInterceptor: (c: new () => object) => void };
    };
    Application.registerInterceptor(Ctor);
  };
}

export function getHandlerInterceptorOptions(
  ctor: Function
): InterceptorOptions {
  return (
    (Reflect.getMetadata(HANDLER_INTERCEPTOR_KEY, ctor) as InterceptorOptions) ??
    {}
  );
}
