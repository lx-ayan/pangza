"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LOCK_KEY = exports.CACHE_KEY = exports.REPEAT_SUBMIT_KEY = exports.RATE_LIMIT_KEY = exports.RateLimiterType = exports.defaultRedisConfig = void 0;
/** 默认配置 */
exports.defaultRedisConfig = {
    host: "127.0.0.1",
    port: 6379,
    db: 0,
    keyPrefix: "pangza:",
    connectTimeout: 3000,
    reconnect: true,
    maxReconnectDelay: 10000,
    mode: "standalone",
};
/** 限流维度 */
exports.RateLimiterType = {
    DEFAULT: "DEFAULT",
    IP: "IP",
    USER: "USER",
};
exports.RATE_LIMIT_KEY = "rateLimiter:";
exports.REPEAT_SUBMIT_KEY = "repeat:submit:";
exports.CACHE_KEY = "cache:";
exports.LOCK_KEY = "lock:";
