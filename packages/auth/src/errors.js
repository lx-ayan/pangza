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
exports.NotRoleError = exports.NotPermissionError = exports.NotLoginError = exports.AuthError = void 0;
var enums_1 = require("@pangza/core/types/enums");
/** 鉴权相关错误基类，携带业务响应码 */
var AuthError = /** @class */ (function (_super) {
    __extends(AuthError, _super);
    function AuthError(message, code) {
        var _this = _super.call(this, message) || this;
        _this.name = "AuthError";
        _this.code = code;
        return _this;
    }
    return AuthError;
}(Error));
exports.AuthError = AuthError;
/** 未登录 */
var NotLoginError = /** @class */ (function (_super) {
    __extends(NotLoginError, _super);
    function NotLoginError(message) {
        if (message === void 0) { message = "未登录"; }
        var _this = _super.call(this, message, enums_1.ResponseCode.UNAUTHORIZED) || this;
        _this.name = "NotLoginError";
        return _this;
    }
    return NotLoginError;
}(AuthError));
exports.NotLoginError = NotLoginError;
/** 无权限 */
var NotPermissionError = /** @class */ (function (_super) {
    __extends(NotPermissionError, _super);
    function NotPermissionError(message) {
        if (message === void 0) { message = "无此权限"; }
        var _this = _super.call(this, message, enums_1.ResponseCode.FORBIDDEN) || this;
        _this.name = "NotPermissionError";
        return _this;
    }
    return NotPermissionError;
}(AuthError));
exports.NotPermissionError = NotPermissionError;
/** 无角色 */
var NotRoleError = /** @class */ (function (_super) {
    __extends(NotRoleError, _super);
    function NotRoleError(message) {
        if (message === void 0) { message = "无此角色"; }
        var _this = _super.call(this, message, enums_1.ResponseCode.FORBIDDEN) || this;
        _this.name = "NotRoleError";
        return _this;
    }
    return NotRoleError;
}(AuthError));
exports.NotRoleError = NotRoleError;
