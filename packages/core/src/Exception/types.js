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
exports.BizException = void 0;
var enums_1 = require("../types/enums");
/** 业务异常（对齐 Spring 自定义业务异常） */
var BizException = /** @class */ (function (_super) {
    __extends(BizException, _super);
    function BizException(message, code, data, httpStatus) {
        if (message === void 0) { message = "操作失败"; }
        if (code === void 0) { code = enums_1.ResponseCode.ERROR; }
        if (data === void 0) { data = null; }
        if (httpStatus === void 0) { httpStatus = 200; }
        var _this = _super.call(this, message) || this;
        _this.name = "BizException";
        _this.code = code;
        _this.data = data;
        _this.httpStatus = httpStatus;
        return _this;
    }
    return BizException;
}(Error));
exports.BizException = BizException;
