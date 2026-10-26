"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTH_MIDDLEWARE_FLAG = void 0;
/** 用于标记 Auth 中间件，供 Application 识别是否已注册鉴权模块 */
var moduleFlags_1 = require("@pangza/core/moduleFlags");
Object.defineProperty(exports, "AUTH_MIDDLEWARE_FLAG", { enumerable: true, get: function () { return moduleFlags_1.AUTH_MIDDLEWARE_FLAG; } });
