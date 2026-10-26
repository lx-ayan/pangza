"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SqlServerDialect = exports.PostgresqlDialect = exports.MysqlDialect = void 0;
exports.getDialect = getDialect;
function replaceQuestionMarks(sql, to) {
    var i = 0;
    return sql.replace(/\?/g, function () { return to(++i); });
}
exports.MysqlDialect = {
    type: "mysql",
    quoteIdent: function (name) {
        return "`".concat(name, "`");
    },
    convertPlaceholders: function (sql) {
        return sql;
    },
    likeEscapeClause: function () {
        return " ESCAPE '\\\\'";
    },
    appendLimitOffset: function (sql, limit, offset) {
        if (offset === void 0) { offset = 0; }
        if (offset > 0)
            return "".concat(sql, " LIMIT ").concat(limit, " OFFSET ").concat(offset);
        return "".concat(sql, " LIMIT ").concat(limit);
    },
    listColumnsSql: function (table) {
        return {
            sql: "SHOW COLUMNS FROM ".concat(this.quoteIdent(table)),
            params: [],
        };
    },
    parseColumnNames: function (rows) {
        return rows.map(function (r) { var _a, _b; return String((_b = (_a = r.Field) !== null && _a !== void 0 ? _a : r.field) !== null && _b !== void 0 ? _b : ""); });
    },
    prepareInsert: function (sql) {
        return { sql: sql, returning: false };
    },
    extractInsertId: function (result) {
        var _a;
        var header = result;
        return Number((_a = header === null || header === void 0 ? void 0 : header.insertId) !== null && _a !== void 0 ? _a : 0);
    },
    extractAffectedRows: function (result) {
        var _a;
        var header = result;
        return Number((_a = header === null || header === void 0 ? void 0 : header.affectedRows) !== null && _a !== void 0 ? _a : 0);
    },
};
exports.PostgresqlDialect = {
    type: "postgresql",
    quoteIdent: function (name) {
        return "\"".concat(name, "\"");
    },
    convertPlaceholders: function (sql) {
        return replaceQuestionMarks(sql, function (i) { return "$".concat(i); });
    },
    likeEscapeClause: function () {
        return " ESCAPE '\\'";
    },
    appendLimitOffset: function (sql, limit, offset) {
        if (offset === void 0) { offset = 0; }
        if (offset > 0)
            return "".concat(sql, " LIMIT ").concat(limit, " OFFSET ").concat(offset);
        return "".concat(sql, " LIMIT ").concat(limit);
    },
    listColumnsSql: function (table) {
        return {
            sql: "SELECT column_name AS \"Field\" FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = ?",
            params: [table],
        };
    },
    parseColumnNames: function (rows) {
        return rows.map(function (r) { var _a, _b, _c; return String((_c = (_b = (_a = r.Field) !== null && _a !== void 0 ? _a : r.field) !== null && _b !== void 0 ? _b : r.column_name) !== null && _c !== void 0 ? _c : ""); });
    },
    prepareInsert: function (sql, idColumn) {
        return {
            sql: "".concat(sql, " RETURNING ").concat(this.quoteIdent(idColumn)),
            returning: true,
        };
    },
    extractInsertId: function (result, idColumn, returning) {
        var _a;
        if (returning && Array.isArray(result) && result[0]) {
            var row = result[0];
            return Number((_a = row[idColumn]) !== null && _a !== void 0 ? _a : 0);
        }
        return 0;
    },
    extractAffectedRows: function (result) {
        var _a, _b;
        if (Array.isArray(result))
            return result.length;
        var header = result;
        return Number((_b = (_a = header === null || header === void 0 ? void 0 : header.rowCount) !== null && _a !== void 0 ? _a : header === null || header === void 0 ? void 0 : header.affectedRows) !== null && _b !== void 0 ? _b : 0);
    },
};
exports.SqlServerDialect = {
    type: "sqlserver",
    quoteIdent: function (name) {
        return "[".concat(name, "]");
    },
    convertPlaceholders: function (sql) {
        // node-mssql 对 ? 支持不稳定，统一转 @p1,@p2
        return replaceQuestionMarks(sql, function (i) { return "@p".concat(i); });
    },
    likeEscapeClause: function () {
        return " ESCAPE '\\'";
    },
    appendLimitOffset: function (sql, limit, offset, hasOrderBy) {
        if (offset === void 0) { offset = 0; }
        if (hasOrderBy === void 0) { hasOrderBy = false; }
        var order = hasOrderBy ? "" : " ORDER BY (SELECT NULL)";
        return "".concat(sql).concat(order, " OFFSET ").concat(offset, " ROWS FETCH NEXT ").concat(limit, " ROWS ONLY");
    },
    listColumnsSql: function (table) {
        return {
            sql: "SELECT COLUMN_NAME AS [Field] FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = ?",
            params: [table],
        };
    },
    parseColumnNames: function (rows) {
        return rows.map(function (r) { var _a, _b, _c; return String((_c = (_b = (_a = r.Field) !== null && _a !== void 0 ? _a : r.field) !== null && _b !== void 0 ? _b : r.COLUMN_NAME) !== null && _c !== void 0 ? _c : ""); });
    },
    prepareInsert: function (sql, idColumn) {
        // INSERT INTO t (a) VALUES (@p1) → INSERT INTO t (a) OUTPUT INSERTED.[id] VALUES (@p1)
        var upper = sql.toUpperCase();
        var valuesIdx = upper.lastIndexOf(" VALUES");
        if (valuesIdx < 0) {
            return { sql: sql, returning: false };
        }
        var head = sql.slice(0, valuesIdx);
        var tail = sql.slice(valuesIdx);
        return {
            sql: "".concat(head, " OUTPUT INSERTED.").concat(this.quoteIdent(idColumn)).concat(tail),
            returning: true,
        };
    },
    extractInsertId: function (result, idColumn, returning) {
        var _a;
        if (returning && Array.isArray(result) && result[0]) {
            var row = result[0];
            return Number((_a = row[idColumn]) !== null && _a !== void 0 ? _a : 0);
        }
        return 0;
    },
    extractAffectedRows: function (result) {
        var _a, _b;
        if (Array.isArray(result))
            return result.length;
        var header = result;
        if (Array.isArray(header === null || header === void 0 ? void 0 : header.rowsAffected)) {
            return Number((_a = header.rowsAffected[0]) !== null && _a !== void 0 ? _a : 0);
        }
        return Number((_b = header === null || header === void 0 ? void 0 : header.affectedRows) !== null && _b !== void 0 ? _b : 0);
    },
};
var DIALECTS = {
    mysql: exports.MysqlDialect,
    postgresql: exports.PostgresqlDialect,
    sqlserver: exports.SqlServerDialect,
};
function getDialect(type) {
    var _a;
    if (type === void 0) { type = "mysql"; }
    var key = String(type || "mysql").toLowerCase();
    var map = {
        mysql: "mysql",
        mariadb: "mysql",
        postgres: "postgresql",
        postgresql: "postgresql",
        pg: "postgresql",
        mssql: "sqlserver",
        sqlserver: "sqlserver",
        "sql-server": "sqlserver",
    };
    var resolved = (_a = map[key]) !== null && _a !== void 0 ? _a : key;
    var dialect = DIALECTS[resolved];
    if (!dialect) {
        throw new Error("\u4E0D\u652F\u6301\u7684\u6570\u636E\u5E93\u7C7B\u578B: ".concat(type));
    }
    return dialect;
}
