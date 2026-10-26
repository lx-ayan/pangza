/**
 * 可选分包运行时加载（monorepo 分包后，未安装的 peer 不拖垮 core）。
 * 开发态仍可用相对路径回退到同仓源码编译结果。
 */
export function optionalRequire<T = any>(
  packageName: string,
  relativeFallback?: string
): T | null {
  try {
    return require(packageName) as T;
  } catch {
    if (!relativeFallback) return null;
    try {
      return require(relativeFallback) as T;
    } catch {
      return null;
    }
  }
}
