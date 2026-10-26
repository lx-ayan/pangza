"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseService = void 0;
function notWired(name) {
    throw new Error("[Service] \u65B9\u6CD5\u672A\u6CE8\u5165\uFF0C\u8BF7\u4F7F\u7528 @Service(Mapper): ".concat(name));
}
/**
 * Service 基类：提供 IService 类型签名。
 * 实际实现由 @Service(Mapper) 覆盖原型方法。
 */
var BaseService = /** @class */ (function () {
    function BaseService() {
    }
    BaseService.prototype.selectById = function (_id) {
        return notWired("selectById");
    };
    BaseService.prototype.selectOne = function (_wrapper) {
        return notWired("selectOne");
    };
    BaseService.prototype.selectList = function (_wrapper, _limit) {
        return notWired("selectList");
    };
    BaseService.prototype.selectCount = function (_wrapper) {
        return notWired("selectCount");
    };
    BaseService.prototype.selectPage = function (_page, _wrapper) {
        return notWired("selectPage");
    };
    BaseService.prototype.insert = function (_entity) {
        return notWired("insert");
    };
    BaseService.prototype.saveBatch = function (_entities) {
        return notWired("saveBatch");
    };
    BaseService.prototype.updateById = function (_entity) {
        return notWired("updateById");
    };
    BaseService.prototype.update = function (_entity, _wrapper) {
        return notWired("update");
    };
    BaseService.prototype.deleteById = function (_id) {
        return notWired("deleteById");
    };
    BaseService.prototype.deleteByIds = function (_ids) {
        return notWired("deleteByIds");
    };
    BaseService.prototype.delete = function (_wrapper) {
        return notWired("delete");
    };
    return BaseService;
}());
exports.BaseService = BaseService;
