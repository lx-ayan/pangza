"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authContext = void 0;
exports.getAuthStore = getAuthStore;
var async_hooks_1 = require("async_hooks");
/**
 * 请求级鉴权上下文。
 * 中间件里 run 一次后，同一次请求内的 AuthUtil 都能取到当前 req/token/session。
 */
exports.authContext = new async_hooks_1.AsyncLocalStorage();
/** 获取当前请求的鉴权上下文；不在 Auth 中间件内时返回 undefined */
function getAuthStore() {
    return exports.authContext.getStore();
}
