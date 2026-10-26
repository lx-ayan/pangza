"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperType = exports.BusinessType = void 0;
/**
 * 业务类型（入库为字符串序数）
 * CREATE=0 … LOGIN=8 … OTHER=9
 */
exports.BusinessType = {
    CREATE: 0,
    UPDATE: 1,
    DELETE: 2,
    READ: 3,
    LIST: 4,
    UPLOAD: 5,
    EXPORT: 6,
    IMPORT: 7,
    LOGIN: 8,
    OTHER: 9,
};
/** 操作端 */
exports.OperType = {
    MOBILE: 0,
    PC: 1,
    OTHER: 2,
};
