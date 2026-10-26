"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapperType = void 0;
function notWired(name) {
    throw new Error("[Mapper] \u65B9\u6CD5\u672A\u6CE8\u5165\uFF0C\u8BF7\u4F7F\u7528 @Mapper(table): ".concat(name));
}
/**
 * Mapper 类型基类：提供与 ORM BaseMapper 对齐的方法签名。
 * 实际实现由 @Mapper(table) 覆盖原型方法。
 */
var MapperType = /** @class */ (function () {
    function MapperType() {
    }
    MapperType.prototype.selectById = function (_id) {
        return notWired("selectById");
    };
    MapperType.prototype.selectOne = function (_wrapper) {
        return notWired("selectOne");
    };
    MapperType.prototype.selectList = function (_wrapper, _limit) {
        return notWired("selectList");
    };
    MapperType.prototype.selectCount = function (_wrapper) {
        return notWired("selectCount");
    };
    MapperType.prototype.selectPage = function (_page, _wrapper) {
        return notWired("selectPage");
    };
    MapperType.prototype.insert = function (_entity) {
        return notWired("insert");
    };
    MapperType.prototype.saveBatch = function (_entities) {
        return notWired("saveBatch");
    };
    MapperType.prototype.updateById = function (_entity) {
        return notWired("updateById");
    };
    MapperType.prototype.update = function (_entity, _wrapper) {
        return notWired("update");
    };
    MapperType.prototype.deleteById = function (_id) {
        return notWired("deleteById");
    };
    MapperType.prototype.deleteByIds = function (_ids) {
        return notWired("deleteByIds");
    };
    MapperType.prototype.delete = function (_wrapper) {
        return notWired("delete");
    };
    return MapperType;
}());
exports.MapperType = MapperType;
