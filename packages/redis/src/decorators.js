"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheEvict = exports.Cacheable = void 0;
exports.RateLimiter = RateLimiter;
exports.RepeatSubmit = RepeatSubmit;
var metadata_1 = require("@pangza/core/Application/metadata");
var cache_1 = require("./cache");
Object.defineProperty(exports, "Cacheable", { enumerable: true, get: function () { return cache_1.Cacheable; } });
Object.defineProperty(exports, "CacheEvict", { enumerable: true, get: function () { return cache_1.CacheEvict; } });
/**
 * 接口限流（对齐 Java @RateLimiter）。
 * @example @RateLimiter({ time: 10, count: 3, type: RateLimiterType.IP })
 * @example @RateLimiter({ time: 60, count: 30, type: RateLimiterType.USER, mode: 'sliding' })
 */
function RateLimiter(option) {
    if (option === void 0) { option = {}; }
    return function (target, propertyKey) {
        (0, metadata_1.mergeMethodRateLimit)(target.constructor, String(propertyKey), option);
    };
}
/**
 * 防重复提交（对齐 Java @RepeatSubmit）。
 * @example @RepeatSubmit()
 * @example @RepeatSubmit({ interval: 5000, message: '请勿重复提交' })
 */
function RepeatSubmit(option) {
    if (option === void 0) { option = {}; }
    return function (target, propertyKey) {
        (0, metadata_1.mergeMethodRepeatSubmit)(target.constructor, String(propertyKey), option);
    };
}
