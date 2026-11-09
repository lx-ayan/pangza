import "reflect-metadata";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import { matchPathPatterns } from "./pathMatch";

export const WEB_FILTER_KEY = Symbol.for("pangza.webFilter.options");

/**
 * Filter 链（对齐 Servlet FilterChain）。
 * `await chain.doFilter(req, res)` 会跑完后续 Filter + 路由并等到响应结束。
 */
export interface FilterChain {
  doFilter(req: Request, res: Response): Promise<void>;
}

/**
 * Servlet 风格 Filter：在 Dispatcher（路由）之外包裹请求。
 *
 * @example
 * class TimingFilter implements Filter {
 *   async doFilter(req, res, chain) {
 *     const t = Date.now();
 *     await chain.doFilter(req, res);
 *     console.log(req.path, Date.now() - t);
 *   }
 * }
 */
export interface Filter {
  doFilter(
    req: Request,
    res: Response,
    chain: FilterChain
  ): void | Promise<void>;
}

/** @WebFilter / addFilter 注册选项（对齐 FilterRegistrationBean） */
export interface FilterOptions {
  /** 越小越靠前，默认 0 */
  order?: number;
  /** 生效路径，默认 `["/**"]` */
  urlPatterns?: string[];
  /** 排除路径 */
  excludePatterns?: string[];
}

export interface FilterRegistration {
  filter: Filter;
  order: number;
  urlPatterns: string[];
  excludePatterns: string[];
}

const registrations: FilterRegistration[] = [];
let filtersMounted = false;

export function isFilter(bean: unknown): bean is Filter {
  return (
    !!bean &&
    typeof bean === "object" &&
    typeof (bean as Filter).doFilter === "function"
  );
}

export function addFilterRegistration(
  filter: Filter,
  options: FilterOptions = {}
): void {
  registrations.push({
    filter,
    order: options.order ?? 0,
    urlPatterns: options.urlPatterns?.length
      ? options.urlPatterns
      : ["/**"],
    excludePatterns: options.excludePatterns ?? [],
  });
}

export function getFilterRegistrations(): readonly FilterRegistration[] {
  return registrations;
}

export function clearFilters(): void {
  registrations.length = 0;
  filtersMounted = false;
}

export function isFiltersMounted(): boolean {
  return filtersMounted;
}

export function markFiltersMounted(): void {
  filtersMounted = true;
}

/** 按 order 升序得到注册表副本 */
export function sortedFilterRegistrations(): FilterRegistration[] {
  return [...registrations].sort((a, b) => a.order - b.order);
}

/**
 * 将单个 Filter 转为 Express 中间件。
 * `await chain.doFilter()` 在响应 `finish`/`close` 后 resolve，便于写 after 逻辑。
 */
export function createFilterMiddleware(
  reg: FilterRegistration
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    if (
      !matchPathPatterns(req.path, reg.urlPatterns, reg.excludePatterns)
    ) {
      next();
      return;
    }

    const chain: FilterChain = {
      doFilter: (_r = req, s = res) =>
        new Promise<void>((resolve, reject) => {
          let settled = false;
          const finish = () => {
            if (settled) return;
            settled = true;
            resolve();
          };
          s.once("finish", finish);
          s.once("close", finish);
          next((err?: unknown) => {
            if (err) {
              s.removeListener("finish", finish);
              s.removeListener("close", finish);
              reject(err);
              return;
            }
            // 下游已同步结束响应时尽快放开 after；否则等 finish
            if (s.writableEnded) {
              finish();
            }
          });
        }),
    };

    Promise.resolve(reg.filter.doFilter(req, res, chain)).catch((err) => {
      next(err);
    });
  };
}

/**
 * 类装饰器：标记 Servlet 风格 Filter（类加载时自动注册）。
 *
 * @example
 * @WebFilter({ urlPatterns: ["/api/**"], order: 1 })
 * class TimingFilter implements Filter {
 *   async doFilter(req, res, chain) {
 *     await chain.doFilter(req, res);
 *   }
 * }
 */
export function WebFilter(options: FilterOptions = {}): ClassDecorator {
  return (ctor) => {
    const Ctor = ctor as unknown as new () => object;
    Reflect.defineMetadata(WEB_FILTER_KEY, options, Ctor);
    const { default: Application } = require("./index") as {
      default: { registerFilter: (c: new () => object) => void };
    };
    Application.registerFilter(Ctor);
  };
}

export function getWebFilterOptions(ctor: Function): FilterOptions {
  return (Reflect.getMetadata(WEB_FILTER_KEY, ctor) as FilterOptions) ?? {};
}
