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
exports.TableName = TableName;
exports.TableId = TableId;
exports.getEntityIdField = getEntityIdField;
exports.TableField = TableField;
exports.getTableName = getTableName;
exports.getEntityFields = getEntityFields;
exports.getEntityTableMeta = getEntityTableMeta;
exports.resolveFieldFill = resolveFieldFill;
exports.applyEntityFieldFills = applyEntityFieldFills;
require("reflect-metadata");
var beanKeys_1 = require("@pangza/core/Json/beanKeys");
var IdType_1 = require("./IdType");
var TABLE_NAME_KEY = Symbol.for("pangza.orm.tableName");
var FIELDS_KEY = Symbol.for("pangza.orm.entityFields");
function fieldMap(ctor) {
    var _a;
    return ((_a = Reflect.getOwnMetadata(FIELDS_KEY, ctor)) !== null && _a !== void 0 ? _a : {});
}
function saveField(ctor, meta) {
    var _a;
    var map = __assign(__assign({}, fieldMap(ctor)), (_a = {}, _a[meta.property] = meta, _a));
    Reflect.defineMetadata(FIELDS_KEY, map, ctor);
    (0, beanKeys_1.addBeanKey)(ctor, meta.property);
}
/**
 * @TableName("user")
 * 标记实体对应表名。
 */
function TableName(tableName) {
    return function (ctor) {
        var name = String(tableName).trim();
        if (!name)
            throw new Error("@TableName 不能为空");
        Reflect.defineMetadata(TABLE_NAME_KEY, name, ctor);
    };
}
/**
 * @TableId() / @TableId("user_id") / @TableId({ value: "user_id", type: IdType.ASSIGN_ID })
 * 标记主键字段及生成策略。
 */
function TableId(valueOrOptions) {
    return function (target, propertyKey) {
        var property = String(propertyKey);
        var column = property;
        var idType = IdType_1.IdType.NONE;
        if (typeof valueOrOptions === "string") {
            column = valueOrOptions || property;
        }
        else if (valueOrOptions) {
            if (valueOrOptions.value)
                column = valueOrOptions.value;
            if (valueOrOptions.type != null) {
                idType = (0, IdType_1.resolveIdType)(valueOrOptions.type);
            }
        }
        var ctor = target.constructor;
        saveField(ctor, {
            property: property,
            column: column,
            id: true,
            idType: idType,
            exist: true,
        });
    };
}
/** 读取实体主键字段元数据（含 IdType） */
function getEntityIdField(entity) {
    return getEntityFields(entity).find(function (f) { return f.id; });
}
/**
 * @TableField("nick_name")
 * @TableField({ value: "create_time", insertFill: () => new Date() })
 */
function TableField(valueOrOptions) {
    return function (target, propertyKey) {
        var property = String(propertyKey);
        var options = {};
        if (typeof valueOrOptions === "string") {
            options = { value: valueOrOptions };
        }
        else if (valueOrOptions) {
            options = valueOrOptions;
        }
        var ctor = target.constructor;
        var prev = fieldMap(ctor)[property];
        saveField(ctor, {
            property: property,
            column: options.value || property,
            id: prev === null || prev === void 0 ? void 0 : prev.id,
            idType: prev === null || prev === void 0 ? void 0 : prev.idType,
            exist: options.exist !== false,
            insertFill: options.insertFill,
            updateFill: options.updateFill,
        });
    };
}
function getTableName(entity) {
    return Reflect.getOwnMetadata(TABLE_NAME_KEY, entity);
}
function getEntityFields(entity) {
    return Object.values(fieldMap(entity));
}
function getEntityTableMeta(entity) {
    var _a;
    var tableName = getTableName(entity);
    if (!tableName)
        return undefined;
    var fields = getEntityFields(entity);
    var idField = fields.find(function (f) { return f.id; });
    return {
        tableName: tableName,
        idColumn: (_a = idField === null || idField === void 0 ? void 0 : idField.column) !== null && _a !== void 0 ? _a : "id",
        fields: fields,
    };
}
function resolveFieldFill(fill) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (fill === undefined)
                        return [2 /*return*/, undefined];
                    if (!(typeof fill === "function")) return [3 /*break*/, 2];
                    return [4 /*yield*/, fill()];
                case 1: return [2 /*return*/, _a.sent()];
                case 2: return [2 /*return*/, fill];
            }
        });
    });
}
/**
 * 按实体 @TableField 的 insertFill / updateFill 填充。
 * 写入列名（column）；属性名与列名不同时同步写属性名，便于对象读写。
 * 仅当目标键仍为 undefined 时填充。
 */
function applyEntityFieldFills(entityClass, row, mode) {
    return __awaiter(this, void 0, void 0, function () {
        var fields, _i, fields_1, field, fill, colKey, propKey, current, value;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!entityClass)
                        return [2 /*return*/];
                    fields = getEntityFields(entityClass);
                    _i = 0, fields_1 = fields;
                    _a.label = 1;
                case 1:
                    if (!(_i < fields_1.length)) return [3 /*break*/, 4];
                    field = fields_1[_i];
                    if (!field.exist)
                        return [3 /*break*/, 3];
                    fill = mode === "insert" ? field.insertFill : field.updateFill;
                    if (fill === undefined)
                        return [3 /*break*/, 3];
                    colKey = field.column;
                    propKey = field.property;
                    current = row[colKey] !== undefined ? row[colKey] : row[propKey];
                    if (current !== undefined)
                        return [3 /*break*/, 3];
                    return [4 /*yield*/, resolveFieldFill(fill)];
                case 2:
                    value = _a.sent();
                    if (value === undefined || value === null)
                        return [3 /*break*/, 3];
                    // 只写列名，避免 camelCase 属性名被当成 SQL 列
                    row[colKey] = value;
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
