"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonIncludeType = void 0;
/**
 * @JsonInclude 策略（对齐 Jackson JsonInclude.Include）
 */
var JsonIncludeType;
(function (JsonIncludeType) {
    /** 始终序列化 */
    JsonIncludeType["ALWAYS"] = "ALWAYS";
    /** 跳过 null / undefined */
    JsonIncludeType["NON_NULL"] = "NON_NULL";
    /** 跳过 null / undefined / '' / [] / 空对象 */
    JsonIncludeType["NON_EMPTY"] = "NON_EMPTY";
    /** 跳过 null / undefined / 0 / false / '' / [] / {} */
    JsonIncludeType["NON_DEFAULT"] = "NON_DEFAULT";
})(JsonIncludeType || (exports.JsonIncludeType = JsonIncludeType = {}));
