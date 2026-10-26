"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperTypeEnum = void 0;
exports.TableSearch = TableSearch;
exports.getTableSearchMeta = getTableSearchMeta;
exports.getQueryWrapper = getQueryWrapper;
exports.getQueryWrapperAndPage = getQueryWrapperAndPage;
require("reflect-metadata");
var beanKeys_1 = require("@pangza/core/Json/beanKeys");
var case_1 = require("@pangza/core/utils/case");
var QueryWrapper_1 = require("./QueryWrapper");
/** 对齐 Java OperTypeEnum（并补充 NOT_* / IN / BETWEEN / IS_NULL） */
exports.OperTypeEnum = {
    EQ: "EQ",
    LIKE: "LIKE",
    LIKE_LEFT: "LIKE_LEFT",
    LIKE_RIGHT: "LIKE_RIGHT",
    NOT_LIKE: "NOT_LIKE",
    GT: "GT",
    GE: "GE",
    LT: "LT",
    LE: "LE",
    NE: "NE",
    IN: "IN",
    NOT_IN: "NOT_IN",
    BETWEEN: "BETWEEN",
    NOT_BETWEEN: "NOT_BETWEEN",
    IS_NULL: "IS_NULL",
    IS_NOT_NULL: "IS_NOT_NULL",
};
var TABLE_SEARCH_KEY = Symbol.for("pangza.orm.tableSearch");
function searchMap(ctor) {
    var _a;
    return ((_a = Reflect.getOwnMetadata(TABLE_SEARCH_KEY, ctor)) !== null && _a !== void 0 ? _a : {});
}
function resolveColumn(property, column) {
    var c = column === null || column === void 0 ? void 0 : column.trim();
    if (c)
        return c;
    return (0, case_1.camelToSnake)(property);
}
/**
 * 标记分页/列表查询字段（对齐 Java @TableSearch）。
 *
 * @example
 * class UserPageDTO {
 *   @TableSearch({ operator: OperTypeEnum.LIKE })
 *   username?: string;
 *   @TableSearch({ column: "name_zh" })
 *   name?: string;
 * }
 */
function TableSearch(options) {
    return function (target, propertyKey) {
        var _a;
        var ctor = target.constructor;
        var prop = String(propertyKey);
        var opts = typeof options === "string" ? { operator: options } : options !== null && options !== void 0 ? options : {};
        var map = __assign({}, searchMap(ctor));
        map[prop] = {
            column: resolveColumn(prop, opts.column),
            operator: (_a = opts.operator) !== null && _a !== void 0 ? _a : exports.OperTypeEnum.EQ,
        };
        Reflect.defineMetadata(TABLE_SEARCH_KEY, map, ctor);
        (0, beanKeys_1.addBeanKey)(ctor, prop);
    };
}
function collectSearchMap(ctor) {
    var proto = Object.getPrototypeOf(ctor.prototype);
    var parentCtor = proto === null || proto === void 0 ? void 0 : proto.constructor;
    var parentMap = parentCtor && parentCtor !== Object ? collectSearchMap(parentCtor) : {};
    return __assign(__assign({}, parentMap), searchMap(ctor));
}
/** 读取类上全部 @TableSearch 元数据（含父类，子类覆盖） */
function getTableSearchMeta(formClass) {
    return Object.entries(collectSearchMap(formClass)).map(function (_a) {
        var property = _a[0], meta = _a[1];
        return ({
            property: property,
            column: meta.column,
            operator: meta.operator,
        });
    });
}
function isEmptyValue(value) {
    if (value == null)
        return true;
    if (typeof value === "string" && value.trim() === "")
        return true;
    if (Array.isArray(value) && value.length === 0)
        return true;
    return false;
}
function toArray(value) {
    if (Array.isArray(value))
        return value;
    if (typeof value === "string") {
        return value
            .split(",")
            .map(function (s) { return s.trim(); })
            .filter(function (s) { return s !== ""; });
    }
    return [value];
}
function toBetweenPair(value) {
    if (Array.isArray(value) && value.length >= 2) {
        return [value[0], value[1]];
    }
    if (typeof value === "string" && value.includes(",")) {
        var parts = value.split(",").map(function (s) { return s.trim(); });
        if (parts.length >= 2)
            return [parts[0], parts[1]];
    }
    return null;
}
function applyOperator(wrapper, operator, column, value) {
    switch (operator) {
        case exports.OperTypeEnum.LIKE:
            wrapper.like(column, String(value));
            break;
        case exports.OperTypeEnum.LIKE_LEFT:
            wrapper.likeLeft(column, String(value));
            break;
        case exports.OperTypeEnum.LIKE_RIGHT:
            wrapper.likeRight(column, String(value));
            break;
        case exports.OperTypeEnum.NOT_LIKE:
            wrapper.notLike(column, String(value));
            break;
        case exports.OperTypeEnum.GT:
            wrapper.gt(column, value);
            break;
        case exports.OperTypeEnum.GE:
            wrapper.ge(column, value);
            break;
        case exports.OperTypeEnum.LT:
            wrapper.lt(column, value);
            break;
        case exports.OperTypeEnum.LE:
            wrapper.le(column, value);
            break;
        case exports.OperTypeEnum.NE:
            wrapper.ne(column, value);
            break;
        case exports.OperTypeEnum.IN:
            wrapper.in(column, toArray(value));
            break;
        case exports.OperTypeEnum.NOT_IN:
            wrapper.notIn(column, toArray(value));
            break;
        case exports.OperTypeEnum.BETWEEN: {
            var pair = toBetweenPair(value);
            if (!pair) {
                throw new Error("@TableSearch BETWEEN \u9700\u8981 [start, end] \u6216 \"start,end\"\uFF0C\u5B57\u6BB5\u5217: ".concat(column));
            }
            wrapper.between(column, pair[0], pair[1]);
            break;
        }
        case exports.OperTypeEnum.NOT_BETWEEN: {
            var pair = toBetweenPair(value);
            if (!pair) {
                throw new Error("@TableSearch NOT_BETWEEN \u9700\u8981 [start, end] \u6216 \"start,end\"\uFF0C\u5B57\u6BB5\u5217: ".concat(column));
            }
            wrapper.notBetween(column, pair[0], pair[1]);
            break;
        }
        case exports.OperTypeEnum.IS_NULL:
            wrapper.isNull(column);
            break;
        case exports.OperTypeEnum.IS_NOT_NULL:
            wrapper.isNotNull(column);
            break;
        case exports.OperTypeEnum.EQ:
        default:
            wrapper.eq(column, value);
            break;
    }
}
function buildFromForm(form, formClass, wrapper) {
    if (form == null || typeof form !== "object")
        return;
    var data = form;
    for (var _i = 0, _a = getTableSearchMeta(formClass); _i < _a.length; _i++) {
        var meta = _a[_i];
        var value = data[meta.property];
        // IS_NULL / IS_NOT_NULL 不依赖表单值；其它运算符空值跳过
        if (meta.operator !== exports.OperTypeEnum.IS_NULL &&
            meta.operator !== exports.OperTypeEnum.IS_NOT_NULL &&
            isEmptyValue(value)) {
            continue;
        }
        applyOperator(wrapper, meta.operator, meta.column, value);
    }
}
/**
 * 根据表单 + DTO 类上的 @TableSearch 构建 QueryWrapper。
 * JSON body 无原型信息，故第二参数必须传类（如 UserPageDTO）。
 */
function getQueryWrapper(form, formClass, consumer) {
    var wrapper = new QueryWrapper_1.QueryWrapper();
    buildFromForm(form, formClass, wrapper);
    consumer === null || consumer === void 0 ? void 0 : consumer(wrapper);
    return wrapper;
}
/**
 * 构建 QueryWrapper + 分页参数。
 *
 * @example
 * getQueryWrapperAndPage(form, UserPageDTO)
 * getQueryWrapperAndPage(form, UserPageDTO, pageNum, pageSize)
 * getQueryWrapperAndPage(form, UserPageDTO, pageNum, pageSize, (w) => w.orderByDesc('create_time'))
 * getQueryWrapperAndPage(form, UserPageDTO, (w) => w.orderByDesc('id'))
 */
function getQueryWrapperAndPage(form, formClass, currentOrConsumer, size, consumer) {
    var current = 1;
    var pageSize = 10;
    var fn;
    if (typeof currentOrConsumer === "function") {
        fn = currentOrConsumer;
    }
    else {
        if (currentOrConsumer != null) {
            var n = Number(currentOrConsumer);
            current = Number.isFinite(n) && n > 0 ? n : 1;
        }
        if (size != null) {
            var n = Number(size);
            pageSize = Number.isFinite(n) && n > 0 ? n : 10;
        }
        fn = consumer;
    }
    return {
        queryWrapper: getQueryWrapper(form, formClass, fn),
        page: { current: current, size: pageSize },
    };
}
