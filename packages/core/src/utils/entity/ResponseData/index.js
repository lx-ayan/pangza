"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var enums_1 = require("../../../types/enums");
var ResponseData = /** @class */ (function () {
    function ResponseData() {
        this.code = enums_1.ResponseCode.SUCCESS;
        this.message = '操作成功';
        this.data = null;
    }
    ResponseData.success = function (data, message) {
        if (message === void 0) { message = '操作成功'; }
        var response = new ResponseData();
        response.data = data;
        response.message = message;
        return response;
    };
    ResponseData.error = function (message, data, code) {
        if (message === void 0) { message = '操作失败'; }
        if (data === void 0) { data = null; }
        if (code === void 0) { code = enums_1.ResponseCode.ERROR; }
        var response = new ResponseData();
        response.code = code;
        response.message = message;
        response.data = data;
        return response;
    };
    return ResponseData;
}());
exports.default = ResponseData;
