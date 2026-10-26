"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnableOrm = EnableOrm;
var Db_1 = require("./Db");
var flag_1 = require("./flag");
/**
 * 显式启用 ORM / 默认数据源：预热仅在 registry 后执行。
 * 未 registry 时启动阶段不会连库；业务首次查询仍可懒连接。
 *
 * @example
 * Application.registry(EnableOrm()).start();
 * Application.registry(EnableOrm({ host: "127.0.0.1", database: "app" })).start();
 */
function EnableOrm(config) {
    (0, flag_1.markOrmEnabled)(true);
    if (config) {
        Db_1.default.register("default", config);
    }
    var middleware = function (_req, _res, next) {
        next();
    };
    Object.defineProperty(middleware, flag_1.ORM_MODULE_FLAG, {
        value: true,
        enumerable: false,
    });
    return middleware;
}
