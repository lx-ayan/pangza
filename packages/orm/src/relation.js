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
exports.ManyToOne = ManyToOne;
exports.OneToMany = OneToMany;
exports.ManyToMany = ManyToMany;
exports.getRelations = getRelations;
exports.getRelation = getRelation;
exports.relationToFieldSelect = relationToFieldSelect;
require("reflect-metadata");
var beanKeys_1 = require("@pangza/core/Json/beanKeys");
var entityDecorators_1 = require("./entityDecorators");
var fieldSelect_1 = require("./fieldSelect");
var security_1 = require("./security");
var dialect_1 = require("./dialect");
var RELATIONS_KEY = Symbol.for("pangza.orm.relations");
function relationMap(ctor) {
    var _a;
    return ((_a = Reflect.getOwnMetadata(RELATIONS_KEY, ctor)) !== null && _a !== void 0 ? _a : {});
}
function saveRelation(ctor, meta) {
    var _a;
    if ((0, fieldSelect_1.getFieldSelect)(ctor, meta.property)) {
        throw new Error("@".concat(meta.kind, "(").concat(meta.property, ") \u4E0E\u5B57\u6BB5 @Select \u4E0D\u80FD\u540C\u65F6\u7528\u4E8E\u540C\u4E00\u5C5E\u6027"));
    }
    var prev = relationMap(ctor)[meta.property];
    if (prev) {
        throw new Error("\u5C5E\u6027 ".concat(meta.property, " \u5DF2\u58F0\u660E\u5173\u8054 ").concat(prev.kind));
    }
    (0, beanKeys_1.addBeanKey)(ctor, meta.property);
    Reflect.defineMetadata(RELATIONS_KEY, __assign(__assign({}, relationMap(ctor)), (_a = {}, _a[meta.property] = meta, _a)), ctor);
}
function resolveTargetTable(target) {
    var name = (0, entityDecorators_1.getTableName)(target);
    if (!name) {
        throw new Error("\u5173\u8054\u76EE\u6807 ".concat(target.name || "Entity", " \u7F3A\u5C11 @TableName"));
    }
    return (0, security_1.assertIdent)(name);
}
function resolveIdColumn(entity, fallback) {
    var _a, _b;
    if (fallback === void 0) { fallback = "id"; }
    return (0, security_1.assertIdent)((_b = (_a = (0, entityDecorators_1.getEntityIdField)(entity)) === null || _a === void 0 ? void 0 : _a.column) !== null && _b !== void 0 ? _b : fallback);
}
/** @ManyToOne(() => Role, { foreignKey: "role_id" }) */
function ManyToOne(target, options) {
    return function (proto, propertyKey) {
        var _a, _b, _c, _d, _e;
        var property = String(propertyKey);
        var fk = (0, security_1.assertIdent)(options.foreignKey);
        saveRelation(proto.constructor, {
            property: property,
            kind: "ManyToOne",
            target: target,
            foreignKey: fk,
            targetKey: (0, security_1.assertIdent)((_a = options.targetKey) !== null && _a !== void 0 ? _a : "id"),
            eager: options.eager !== false,
            fetch: (_b = options.fetch) !== null && _b !== void 0 ? _b : "SELECT",
            depth: Math.max(0, (_c = options.depth) !== null && _c !== void 0 ? _c : 0),
            many: false,
            datasource: ((_d = options.datasource) === null || _d === void 0 ? void 0 : _d.trim()) || undefined,
            db: ((_e = options.db) === null || _e === void 0 ? void 0 : _e.trim()) || undefined,
        });
    };
}
/** @OneToMany(() => Menu, { foreignKey: "parent_id" }) */
function OneToMany(target, options) {
    return function (proto, propertyKey) {
        var _a, _b, _c, _d;
        var property = String(propertyKey);
        saveRelation(proto.constructor, {
            property: property,
            kind: "OneToMany",
            target: target,
            foreignKey: (0, security_1.assertIdent)(options.foreignKey),
            targetKey: "id",
            localKey: options.localKey
                ? (0, security_1.assertIdent)(options.localKey)
                : undefined,
            eager: options.eager === true,
            fetch: (_a = options.fetch) !== null && _a !== void 0 ? _a : "SELECT",
            depth: Math.max(0, (_b = options.depth) !== null && _b !== void 0 ? _b : 0),
            many: true,
            datasource: ((_c = options.datasource) === null || _c === void 0 ? void 0 : _c.trim()) || undefined,
            db: ((_d = options.db) === null || _d === void 0 ? void 0 : _d.trim()) || undefined,
        });
    };
}
/** @ManyToMany(() => Role, { joinTable, joinColumn, inverseJoinColumn }) */
function ManyToMany(target, options) {
    return function (proto, propertyKey) {
        var _a, _b, _c, _d, _e;
        var property = String(propertyKey);
        saveRelation(proto.constructor, {
            property: property,
            kind: "ManyToMany",
            target: target,
            joinTable: (0, security_1.assertIdent)(options.joinTable),
            joinColumn: (0, security_1.assertIdent)(options.joinColumn),
            inverseJoinColumn: (0, security_1.assertIdent)(options.inverseJoinColumn),
            targetKey: (0, security_1.assertIdent)((_a = options.targetKey) !== null && _a !== void 0 ? _a : "id"),
            localKey: options.localKey
                ? (0, security_1.assertIdent)(options.localKey)
                : undefined,
            eager: options.eager === true,
            fetch: (_b = options.fetch) !== null && _b !== void 0 ? _b : "SELECT",
            depth: Math.max(0, (_c = options.depth) !== null && _c !== void 0 ? _c : 0),
            many: true,
            datasource: ((_d = options.datasource) === null || _d === void 0 ? void 0 : _d.trim()) || undefined,
            db: ((_e = options.db) === null || _e === void 0 ? void 0 : _e.trim()) || undefined,
        });
    };
}
function getRelations(entity) {
    return Object.values(relationMap(entity));
}
function getRelation(entity, property) {
    return relationMap(entity)[property];
}
/**
 * 把关联元数据编译为 FieldSelect 形态（复用 hydrate 批 IN）。
 * SQL 使用指定方言引号。
 */
function relationToFieldSelect(ownerEntity, meta, dialect) {
    var _a, _b;
    var d = dialect !== null && dialect !== void 0 ? dialect : (0, dialect_1.getDialect)("mysql");
    var q = function (name) { return d.quoteIdent((0, security_1.assertIdent)(name)); };
    var target = meta.target();
    var targetTable = resolveTargetTable(target);
    var sql;
    if (meta.kind === "ManyToOne") {
        var fk = meta.foreignKey;
        sql = "SELECT * FROM ".concat(q(targetTable), " WHERE ").concat(q(meta.targetKey), " = #{").concat(fk, "}");
    }
    else if (meta.kind === "OneToMany") {
        var localKey = (_a = meta.localKey) !== null && _a !== void 0 ? _a : resolveIdColumn(ownerEntity);
        sql = "SELECT * FROM ".concat(q(targetTable), " WHERE ").concat(q(meta.foreignKey), " = #{").concat(localKey, "}");
    }
    else {
        var localKey = (_b = meta.localKey) !== null && _b !== void 0 ? _b : resolveIdColumn(ownerEntity);
        var jt = meta.joinTable;
        var alias = "t";
        var j = "j";
        sql =
            "SELECT ".concat(q(alias), ".* FROM ").concat(q(targetTable), " ").concat(q(alias), " ") +
                "INNER JOIN ".concat(q(jt), " ").concat(q(j), " ON ").concat(q(j), ".").concat(q(meta.inverseJoinColumn), " = ").concat(q(alias), ".").concat(q(meta.targetKey), " ") +
                "WHERE ".concat(q(j), ".").concat(q(meta.joinColumn), " = #{").concat(localKey, "}");
    }
    return {
        property: meta.property,
        sql: sql,
        many: meta.many,
        depth: meta.depth,
        eager: meta.eager,
        datasource: meta.datasource,
        db: meta.db,
    };
}
