"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdType = void 0;
exports.resolveIdType = resolveIdType;
/**
 * 主键生成策略（对齐 MyBatis-Plus IdType）
 *
 * @example
 * @TableId({ type: IdType.ASSIGN_ID })
 * id!: string;
 */
var IdType;
(function (IdType) {
    /** 数据库自增（不向 INSERT 写入 id，插入后回填） */
    IdType["AUTO"] = "AUTO";
    /** 未设置：跟随全局 configureOrm / ORM_ID_TYPE */
    IdType["NONE"] = "NONE";
    /** 插入前自行赋值，框架不生成 */
    IdType["INPUT"] = "INPUT";
    /** 雪花算法分配（空才生成），适合 number / string */
    IdType["ASSIGN_ID"] = "ASSIGN_ID";
    /** UUID（去横线）分配，适合 string */
    IdType["ASSIGN_UUID"] = "ASSIGN_UUID";
})(IdType || (exports.IdType = IdType = {}));
function resolveIdType(value) {
    if (value == null || value === "")
        return IdType.NONE;
    var key = String(value).toUpperCase();
    if (key in IdType) {
        return IdType[key];
    }
    throw new Error("\u4E0D\u652F\u6301\u7684 IdType: ".concat(value));
}
