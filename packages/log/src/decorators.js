"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogDecorator = LogDecorator;
var metadata_1 = require("@pangza/core/Application/metadata");
/**
 * 方法装饰器：为接口声明操作日志。
 * 推荐从 `@pangza/core/Application` 导入同名装饰器。
 */
function LogDecorator(options) {
    if (options === void 0) { options = {}; }
    return function (target, propertyKey) {
        (0, metadata_1.mergeMethodLog)(target.constructor, String(propertyKey), options);
    };
}
