/** 规范化请求/模式路径：保证前导 /，去掉无意义尾 / */
export function normalizePathPattern(p: string): string {
  if (!p) return "/";
  let s = p.trim();
  if (!s.startsWith("/")) s = `/${s}`;
  if (
    s.length > 1 &&
    s.endsWith("/") &&
    !s.endsWith("*/") &&
    !s.endsWith("**/")
  ) {
    s = s.slice(0, -1);
  }
  return s;
}

/**
 * 类 Ant / glob 路径匹配（与 @pangza/auth ignore 规则对齐）：
 * - `/api/user`      精确，或该路径下的子路径
 * - `/api/pub/**`    前缀下全部
 * - `/api/pub/*`     仅一层
 * - `/api/aes*`      尾部 * 前缀
 */
export function matchPathPattern(requestPath: string, pattern: string): boolean {
  const path = normalizePathPattern(requestPath);
  const pat = normalizePathPattern(pattern);

  if (pat.endsWith("/**")) {
    const base = pat.slice(0, -3);
    if (!base || base === "/") return true;
    return path === base || path.startsWith(`${base}/`);
  }

  if (pat.endsWith("/*")) {
    const base = pat.slice(0, -2);
    if (!path.startsWith(`${base}/`)) return false;
    const rest = path.slice(base.length + 1);
    return rest.length > 0 && !rest.includes("/");
  }

  if (pat.endsWith("*") && !pat.slice(0, -1).includes("*")) {
    return path.startsWith(pat.slice(0, -1));
  }

  if (pat.includes("*")) {
    return globToRegExp(pat).test(path);
  }

  return path === pat || path.startsWith(`${pat}/`);
}

/** 是否命中 include（空=全部），且未命中 exclude */
export function matchPathPatterns(
  requestPath: string,
  include: string[] = ["/**"],
  exclude: string[] = []
): boolean {
  const path = normalizePathPattern(requestPath);
  const includes = include.length ? include : ["/**"];
  if (!includes.some((p) => matchPathPattern(path, p))) return false;
  if (exclude.some((p) => matchPathPattern(path, p))) return false;
  return true;
}

function globToRegExp(pattern: string): RegExp {
  let i = 0;
  let out = "^";
  while (i < pattern.length) {
    const ch = pattern[i]!;
    if (ch === "*" && pattern[i + 1] === "*") {
      out += ".*";
      i += 2;
      if (pattern[i] === "/") i += 1;
      continue;
    }
    if (ch === "*") {
      out += "[^/]*";
      i += 1;
      continue;
    }
    if (".+^${}()|[]\\".includes(ch)) {
      out += `\\${ch}`;
    } else {
      out += ch;
    }
    i += 1;
  }
  out += "/?$";
  return new RegExp(out);
}
