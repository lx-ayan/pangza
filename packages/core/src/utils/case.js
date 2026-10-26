"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.snakeToCamel = snakeToCamel;
exports.camelToSnake = camelToSnake;
exports.rowToCamel = rowToCamel;
exports.rowsToCamel = rowsToCamel;
exports.omitPassword = omitPassword;
/** snake_case → camelCase */
function snakeToCamel(key) {
    return key.replace(/_([a-z])/g, function (_, c) { return c.toUpperCase(); });
}
/** camelCase → snake_case */
function camelToSnake(key) {
    return key.replace(/[A-Z]/g, function (c) { return "_".concat(c.toLowerCase()); });
}
/** 将行对象键名转为 camelCase（递归处理一层数组/对象） */
function rowToCamel(row) {
    if (!row)
        return null;
    var out = {};
    for (var _i = 0, _a = Object.entries(row); _i < _a.length; _i++) {
        var _b = _a[_i], k = _b[0], v = _b[1];
        out[snakeToCamel(k)] = v;
    }
    return out;
}
function rowsToCamel(rows) {
    return rows.map(function (r) { return rowToCamel(r); });
}
/** 去掉 password 字段 */
function omitPassword(row) {
    if (!row)
        return null;
    var _a = row, _p = _a.password, rest = __rest(_a, ["password"]);
    return rest;
}
