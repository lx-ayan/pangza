import type { Request, Response } from "express";
import type { RouteOption } from "./types";
import { ParamType } from "./types";

/** 普通接口：按 @Request* 注入；未标注形参默认 req */
export function resolveCallbackArgs(
  req: Request,
  option?: RouteOption,
  arity = 1
): unknown[] {
  const metas = option?.params;
  if (metas && metas.length > 0) {
    const maxIndex = Math.max(arity - 1, ...metas.map((m) => m.index));
    const args: unknown[] = new Array(maxIndex + 1);
    for (let i = 0; i <= maxIndex; i++) {
      args[i] = req;
    }
    for (const meta of metas) {
      args[meta.index] = resolveParamInject(req, meta);
    }
    return args;
  }
  return [resolveCallbackArg(req, option)];
}

/**
 * flux / raw：支持 @RequestBody 等注入，同时保证能拿到 res。
 * - 无参数装饰器：固定 (req, res)
 * - 有装饰器：已标注的按来源注入；未标注的按顺序补 req / res
 *   （1 个未标注 → res；多个 → 第一个 req，其余 res）
 */
export function resolveRawCallbackArgs(
  req: Request,
  res: Response,
  option?: RouteOption,
  arity = 2
): unknown[] {
  const metas = option?.params;
  if (!metas || metas.length === 0) {
    return [req, res];
  }

  const maxIndex = Math.max(arity - 1, ...metas.map((m) => m.index));
  const args: unknown[] = new Array(maxIndex + 1);
  const decorated = new Set(metas.map((m) => m.index));
  for (const meta of metas) {
    args[meta.index] = resolveParamInject(req, meta);
  }

  const undecorated: number[] = [];
  for (let i = 0; i <= maxIndex; i++) {
    if (!decorated.has(i)) undecorated.push(i);
  }
  if (undecorated.length === 0) {
    args.push(res);
  } else if (undecorated.length === 1) {
    args[undecorated[0]] = res;
  } else {
    args[undecorated[0]] = req;
    for (let i = 1; i < undecorated.length; i++) {
      args[undecorated[i]] = res;
    }
  }
  return args;
}

type RequestWithFiles = Request & {
  cookies?: unknown;
  file?: unknown;
  files?: unknown;
};

/** urlencoded / multipart 字段在 req.body；multer 等会挂 file(s) */
function resolveFormData(req: Request, fieldName?: string): unknown {
  const body =
    req.body && typeof req.body === "object" ? (req.body as Record<string, unknown>) : {};
  if (fieldName !== undefined) {
    return body[fieldName];
  }
  const anyReq = req as RequestWithFiles;
  if (anyReq.file !== undefined || anyReq.files !== undefined) {
    return {
      ...body,
      ...(anyReq.file !== undefined ? { file: anyReq.file } : {}),
      ...(anyReq.files !== undefined ? { files: anyReq.files } : {}),
    };
  }
  return body;
}

function resolveParamInject(
  req: Request,
  meta: NonNullable<RouteOption["params"]>[number]
): unknown {
  switch (meta.source) {
    case "body":
      return req.body ?? {};
    case "query":
      return req.query ?? {};
    case "header":
      return req.headers ?? {};
    case "cookie":
      return (req as RequestWithFiles).cookies ?? {};
    case "form":
      return resolveFormData(req, meta.name);
    case "path": {
      const values = Object.values(req.params ?? {});
      if (meta.pathIndex !== undefined) {
        return values[meta.pathIndex];
      }
      if (values.length <= 1) return values[0];
      return values;
    }
    default:
      return req;
  }
}

/** 无参数装饰器时，按 paramType 解析单个入参；未配置则传 req */
function resolveCallbackArg(req: Request, option?: RouteOption): unknown {
  const type = option?.paramType;
  if (!type) return req;

  switch (type) {
    case ParamType.BODY:
      return req.body ?? {};
    case ParamType.QUERY:
      return req.query ?? {};
    case ParamType.HEADER:
      return req.headers ?? {};
    case ParamType.COOKIE:
      return (req as RequestWithFiles).cookies ?? {};
    case ParamType.FORM:
      return resolveFormData(req);
    case ParamType.PATH:
    case ParamType.PARAMS: {
      const values = Object.values(req.params ?? {});
      if (values.length <= 1) return values[0];
      return values;
    }
    default:
      return req;
  }
}
