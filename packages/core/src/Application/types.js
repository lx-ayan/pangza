"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParamType = void 0;
/** 回调入参来源（RouteOption.paramType / 兼容旧写法） */
var ParamType;
(function (ParamType) {
    ParamType["BODY"] = "body";
    ParamType["QUERY"] = "query";
    ParamType["PARAMS"] = "params";
    ParamType["HEADER"] = "header";
    ParamType["COOKIE"] = "cookie";
    ParamType["PATH"] = "path";
})(ParamType || (exports.ParamType = ParamType = {}));
