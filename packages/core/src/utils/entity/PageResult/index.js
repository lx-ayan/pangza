"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toPageResult = toPageResult;
/** 将 ORM IPage 转为 PageResult */
function toPageResult(page) {
    var _a;
    var pageSize = page.size || 10;
    var total = page.total || 0;
    return {
        total: total,
        list: (_a = page.records) !== null && _a !== void 0 ? _a : [],
        pageNum: page.current || 1,
        pageSize: pageSize,
        pages: pageSize > 0 ? Math.ceil(total / pageSize) : 0,
    };
}
