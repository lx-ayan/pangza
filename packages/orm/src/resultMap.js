"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapResultRow = mapResultRow;
exports.mapResultRows = mapResultRows;
var case_1 = require("@pangza/core/utils/case");
var config_1 = require("./config");
/**
 * 查询结果键名映射（对齐 MyBatis mapUnderscoreToCamelCase）。
 * 默认开启：create_time → createTime。
 */
function mapResultRow(row) {
    if (!row)
        return null;
    if (!(0, config_1.getOrmConfig)().mapUnderscoreToCamelCase)
        return row;
    return (0, case_1.rowToCamel)(row);
}
function mapResultRows(rows) {
    if (!(rows === null || rows === void 0 ? void 0 : rows.length))
        return rows !== null && rows !== void 0 ? rows : [];
    if (!(0, config_1.getOrmConfig)().mapUnderscoreToCamelCase)
        return rows;
    return (0, case_1.rowsToCamel)(rows);
}
