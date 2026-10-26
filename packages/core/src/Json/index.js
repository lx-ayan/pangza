"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonIncludeType = exports.getBeanKeys = exports.addBeanKey = exports.JsonProperty = exports.pick = exports.copyProperties = exports.convert = exports.getJsonFieldInclude = exports.getJsonFieldIncludes = exports.getClassJsonInclude = exports.getGlobalFieldInclude = exports.getGlobalFieldFormat = exports.getJsonFieldFormat = exports.getJsonFieldFormats = exports.JsonInclude = exports.JsonFormat = exports.shouldOmitByInclude = exports.formatDate = exports.ObjectMapper = void 0;
exports.default = Json;
var ObjectMapper_1 = require("./ObjectMapper");
var ObjectMapper_2 = require("./ObjectMapper");
Object.defineProperty(exports, "ObjectMapper", { enumerable: true, get: function () { return ObjectMapper_2.ObjectMapper; } });
Object.defineProperty(exports, "formatDate", { enumerable: true, get: function () { return ObjectMapper_2.formatDate; } });
Object.defineProperty(exports, "shouldOmitByInclude", { enumerable: true, get: function () { return ObjectMapper_2.shouldOmitByInclude; } });
var decorators_1 = require("./decorators");
Object.defineProperty(exports, "JsonFormat", { enumerable: true, get: function () { return decorators_1.JsonFormat; } });
Object.defineProperty(exports, "JsonInclude", { enumerable: true, get: function () { return decorators_1.JsonInclude; } });
Object.defineProperty(exports, "getJsonFieldFormats", { enumerable: true, get: function () { return decorators_1.getJsonFieldFormats; } });
Object.defineProperty(exports, "getJsonFieldFormat", { enumerable: true, get: function () { return decorators_1.getJsonFieldFormat; } });
Object.defineProperty(exports, "getGlobalFieldFormat", { enumerable: true, get: function () { return decorators_1.getGlobalFieldFormat; } });
Object.defineProperty(exports, "getGlobalFieldInclude", { enumerable: true, get: function () { return decorators_1.getGlobalFieldInclude; } });
Object.defineProperty(exports, "getClassJsonInclude", { enumerable: true, get: function () { return decorators_1.getClassJsonInclude; } });
Object.defineProperty(exports, "getJsonFieldIncludes", { enumerable: true, get: function () { return decorators_1.getJsonFieldIncludes; } });
Object.defineProperty(exports, "getJsonFieldInclude", { enumerable: true, get: function () { return decorators_1.getJsonFieldInclude; } });
var convert_1 = require("./convert");
Object.defineProperty(exports, "convert", { enumerable: true, get: function () { return convert_1.convert; } });
Object.defineProperty(exports, "copyProperties", { enumerable: true, get: function () { return convert_1.copyProperties; } });
Object.defineProperty(exports, "pick", { enumerable: true, get: function () { return convert_1.pick; } });
Object.defineProperty(exports, "JsonProperty", { enumerable: true, get: function () { return convert_1.JsonProperty; } });
var beanKeys_1 = require("./beanKeys");
Object.defineProperty(exports, "addBeanKey", { enumerable: true, get: function () { return beanKeys_1.addBeanKey; } });
Object.defineProperty(exports, "getBeanKeys", { enumerable: true, get: function () { return beanKeys_1.getBeanKeys; } });
var types_1 = require("./types");
Object.defineProperty(exports, "JsonIncludeType", { enumerable: true, get: function () { return types_1.JsonIncludeType; } });
/**
 * 可选模块工厂：通过 Application.registry(Json({ dateFormat: '...' })) 配置全局序列化。
 * 不注册时仍会使用默认 ObjectMapper（Date → yyyy-MM-dd HH:mm:ss）。
 */
function Json(options) {
    if (options === void 0) { options = {}; }
    ObjectMapper_1.ObjectMapper.configure(options);
    var middleware = function (_req, _res, next) { return next(); };
    Object.defineProperty(middleware, Symbol.for("pangza.json.module"), {
        value: true,
        enumerable: false,
    });
    return middleware;
}
