"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalRequire = optionalRequire;
/**
 * 可选分包运行时加载（monorepo 分包后，未安装的 peer 不拖垮 core）。
 * 开发态仍可用相对路径回退到同仓源码编译结果。
 */
function optionalRequire(packageName, relativeFallback) {
    try {
        return require(packageName);
    }
    catch (_a) {
        if (!relativeFallback)
            return null;
        try {
            return require(relativeFallback);
        }
        catch (_b) {
            return null;
        }
    }
}
