/**
 * 跨包模块标记（Symbol.for 全局唯一）。
 * @pangza/core 用这些识别 registry 中的可选分包，避免硬依赖 auth/orm/redis/log。
 */

export const AUTH_MIDDLEWARE_FLAG = Symbol.for("pangza.auth.middleware");
export const LOG_MIDDLEWARE_FLAG = Symbol.for("pangza.log.middleware");
export const REDIS_MODULE_FLAG = Symbol.for("pangza.redis.module");
export const ORM_MODULE_FLAG = Symbol.for("pangza.orm.module");

let redisEnabled = false;
let ormEnabled = false;

export function markRedisEnabled(enabled = true): void {
  redisEnabled = enabled;
}

export function isRedisEnabled(): boolean {
  return redisEnabled;
}

export function markOrmEnabled(enabled = true): void {
  ormEnabled = enabled;
}

export function isOrmEnabled(): boolean {
  return ormEnabled;
}
