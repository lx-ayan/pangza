"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.OptimisticLockError = exports.OrmError = void 0;
var enums_1 = require("@pangza/core/types/enums");
/** ORM 业务错误，携带响应码 */
var OrmError = /** @class */ (function (_super) {
    __extends(OrmError, _super);
    function OrmError(message, code) {
        if (code === void 0) { code = enums_1.ResponseCode.ERROR; }
        var _this = _super.call(this, message) || this;
        _this.name = "OrmError";
        _this.code = code;
        return _this;
    }
    return OrmError;
}(Error));
exports.OrmError = OrmError;
/** 乐观锁版本不匹配 */
var OptimisticLockError = /** @class */ (function (_super) {
    __extends(OptimisticLockError, _super);
    function OptimisticLockError(message) {
        if (message === void 0) { message = "数据已被修改，请刷新后重试"; }
        var _this = _super.call(this, message, enums_1.ResponseCode.CONFLICT) || this;
        _this.name = "OptimisticLockError";
        return _this;
    }
    return OptimisticLockError;
}(OrmError));
exports.OptimisticLockError = OptimisticLockError;
