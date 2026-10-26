"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateHandler = validateHandler;
exports.validateHandlerSync = validateHandlerSync;
exports.validateMethodArgs = validateMethodArgs;
var decorators_1 = require("./decorators");
var types_1 = require("./types");
function isClassSchema(schema) {
    return typeof schema === "function";
}
function resolveRules(schema) {
    if (isClassSchema(schema)) {
        return (0, decorators_1.getClassRules)(schema);
    }
    return schema !== null && schema !== void 0 ? schema : {};
}
/**
 * 函数式校验（对齐 Spring Validator / @Valid）。
 * 失败抛出 ValidationError。
 *
 * @example
 * validateHandler(body, CreateUserDTO);
 * validateHandler(body, {
 *   email: [email('邮箱不对'), notNull()],
 *   age: [min(1), max(120)],
 * });
 */
function validateHandler(data, schema) {
    return __awaiter(this, void 0, void 0, function () {
        var rules, errors, obj, _i, _a, _b, field, fieldRules, list, value, _c, list_1, rule, ok;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    rules = resolveRules(schema);
                    errors = [];
                    obj = data && typeof data === "object" ? data : {};
                    _i = 0, _a = Object.entries(rules);
                    _d.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 6];
                    _b = _a[_i], field = _b[0], fieldRules = _b[1];
                    list = fieldRules;
                    value = obj[field];
                    _c = 0, list_1 = list;
                    _d.label = 2;
                case 2:
                    if (!(_c < list_1.length)) return [3 /*break*/, 5];
                    rule = list_1[_c];
                    return [4 /*yield*/, rule.validate(value, data)];
                case 3:
                    ok = _d.sent();
                    if (!ok) {
                        errors.push({
                            field: field,
                            message: rule.message,
                            rule: rule.name,
                        });
                        return [3 /*break*/, 5]; // 同一字段遇错即停，类似默认 Spring 行为可简化
                    }
                    _d.label = 4;
                case 4:
                    _c++;
                    return [3 /*break*/, 2];
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6:
                    if (errors.length > 0) {
                        throw new types_1.ValidationError(errors);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
/** 同步版本：规则内不要用 async */
function validateHandlerSync(data, schema) {
    var rules = resolveRules(schema);
    var errors = [];
    var obj = data && typeof data === "object" ? data : {};
    for (var _i = 0, _a = Object.entries(rules); _i < _a.length; _i++) {
        var _b = _a[_i], field = _b[0], fieldRules = _b[1];
        var value = obj[field];
        for (var _c = 0, fieldRules_1 = fieldRules; _c < fieldRules_1.length; _c++) {
            var rule = fieldRules_1[_c];
            var result = rule.validate(value, data);
            var ok = typeof result === "boolean" ? result : false;
            if (!ok) {
                errors.push({ field: field, message: rule.message, rule: rule.name });
                break;
            }
        }
    }
    if (errors.length > 0) {
        throw new types_1.ValidationError(errors);
    }
}
var SKIP_TYPES = new Set([
    Object,
    String,
    Number,
    Boolean,
    Array,
    Function,
]);
/**
 * 按 design:paramtypes 校验方法入参（供 Application 调用）。
 */
function validateMethodArgs(args_1) {
    return __awaiter(this, arguments, void 0, function (args, paramTypes) {
        var i, Type, rules;
        if (paramTypes === void 0) { paramTypes = []; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < paramTypes.length)) return [3 /*break*/, 4];
                    Type = paramTypes[i];
                    if (!Type || SKIP_TYPES.has(Type))
                        return [3 /*break*/, 3];
                    rules = (0, decorators_1.getClassRules)(Type);
                    if (Object.keys(rules).length === 0)
                        return [3 /*break*/, 3];
                    return [4 /*yield*/, validateHandler(args[i], Type)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
