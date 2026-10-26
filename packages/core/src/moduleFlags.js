"use strict";
/**
 * 跨包模块标记（Symbol.for 全局唯一）。
 * @pangza/core 用这些识别 registry 中的可选分包，避免硬依赖 auth/orm/redis/log。
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ORM_MODULE_FLAG = exports.REDIS_MODULE_FLAG = exports.LOG_MIDDLEWARE_FLAG = exports.AUTH_MIDDLEWARE_FLAG = void 0;
exports.markRedisEnabled = markRedisEnabled;
exports.isRedisEnabled = isRedisEnabled;
exports.markOrmEnabled = markOrmEnabled;
exports.isOrmEnabled = isOrmEnabled;
exports.AUTH_MIDDLEWARE_FLAG = Symbol.for("pangza.auth.middleware");
exports.LOG_MIDDLEWARE_FLAG = Symbol.for("pangza.log.middleware");
exports.REDIS_MODULE_FLAG = Symbol.for("pangza.redis.module");
exports.ORM_MODULE_FLAG = Symbol.for("pangza.orm.module");
var redisEnabled = false;
var ormEnabled = false;
function markRedisEnabled(enabled) {
    if (enabled === void 0) { enabled = true; }
    redisEnabled = enabled;
}
function isRedisEnabled() {
    return redisEnabled;
}
function markOrmEnabled(enabled) {
    if (enabled === void 0) { enabled = true; }
    ormEnabled = enabled;
}
function isOrmEnabled() {
    return ormEnabled;
}
