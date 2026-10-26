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
exports.LockError = exports.GuardError = void 0;
var enums_1 = require("@pangza/core/types/enums");
/** 限流 / 防重复提交业务错误（对齐 Java BusinessException，业务码 500） */
var GuardError = /** @class */ (function (_super) {
    __extends(GuardError, _super);
    function GuardError(message, code) {
        if (code === void 0) { code = enums_1.ResponseCode.ERROR; }
        var _this = _super.call(this, message) || this;
        _this.name = "GuardError";
        _this.code = code;
        return _this;
    }
    return GuardError;
}(Error));
exports.GuardError = GuardError;
/** 获取分布式锁失败 */
var LockError = /** @class */ (function (_super) {
    __extends(LockError, _super);
    function LockError(message) {
        if (message === void 0) { message = "获取锁失败"; }
        var _this = _super.call(this, message) || this;
        _this.name = "LockError";
        return _this;
    }
    return LockError;
}(Error));
exports.LockError = LockError;
