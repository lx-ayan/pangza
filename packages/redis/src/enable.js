"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnableRedis = EnableRedis;
var Redis_1 = require("./Redis");
var flag_1 = require("./flag");
/**
 * 显式启用 Redis：预热 / 连接校验仅在 registry 后执行。
 * 未 registry 时不会在启动阶段连 Redis，避免无 Redis 用户被报错刷屏。
 *
 * @example
 * Application.registry(EnableRedis()).start();
 * Application.registry(EnableRedis({ host: "127.0.0.1", port: 6379 })).start();
 */
function EnableRedis(config) {
    if (config)
        Redis_1.default.configure(config);
    (0, flag_1.markRedisEnabled)(true);
    var middleware = function (_req, _res, next) {
        next();
    };
    Object.defineProperty(middleware, flag_1.REDIS_MODULE_FLAG, {
        value: true,
        enumerable: false,
    });
    return middleware;
}
