"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nextId = nextId;
var optional_1 = require("../optional");
/**
 * @deprecated 请用实体 `@TableId({ type: IdType.ASSIGN_ID })`（全局默认已是 ASSIGN_ID），
 * insert 时自动生成；或 `getIdentifierGenerator().nextId()`。
 */
function nextId() {
    var _a, _b;
    var mod = (_a = (0, optional_1.optionalRequire)("@pangza/orm/identifier")) !== null && _a !== void 0 ? _a : (0, optional_1.optionalRequire)("@pangza/orm");
    var gen = (_b = mod === null || mod === void 0 ? void 0 : mod.getIdentifierGenerator) === null || _b === void 0 ? void 0 : _b.call(mod);
    if (!(gen === null || gen === void 0 ? void 0 : gen.nextId)) {
        throw new Error("[nextId] 需要安装 @pangza/orm 才能生成分布式 ID");
    }
    var id = gen.nextId();
    return typeof id === "string" ? id : String(id);
}
