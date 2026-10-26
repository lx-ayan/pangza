"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultIdentifierGenerator = void 0;
exports.setIdentifierGenerator = setIdentifierGenerator;
exports.getIdentifierGenerator = getIdentifierGenerator;
var crypto_1 = require("crypto");
var config_1 = require("@pangza/core/config");
/** 简易雪花：41bit 时间 + 10bit 机器 + 12bit 序列 */
var SnowflakeGenerator = /** @class */ (function () {
    function SnowflakeGenerator(workerId) {
        if (workerId === void 0) { workerId = 1; }
        this.epoch = 1704067200000n; // 2024-01-01
        this.seq = 0n;
        this.lastTs = -1n;
        this.workerId = BigInt(workerId & 0x3ff);
    }
    SnowflakeGenerator.prototype.next = function () {
        var ts = BigInt(Date.now());
        if (ts === this.lastTs) {
            this.seq = (this.seq + 1n) & 0xfffn;
            if (this.seq === 0n) {
                while (ts <= this.lastTs)
                    ts = BigInt(Date.now());
            }
        }
        else {
            this.seq = 0n;
        }
        this.lastTs = ts;
        return ((ts - this.epoch) << 22n) | (this.workerId << 12n) | this.seq;
    };
    return SnowflakeGenerator;
}());
var snowflake = new SnowflakeGenerator(Number(config_1.ormEnvConfig.workerId) || 1);
exports.defaultIdentifierGenerator = {
    nextId: function () {
        // 返回 string，避免 JS 大整数精度丢失；业务需要 number 时可自行 Number()
        return snowflake.next().toString();
    },
    nextUUID: function () {
        // 32 位无横线 hex（对齐 MyBatis-Plus ASSIGN_UUID）
        return (0, crypto_1.randomBytes)(16).toString("hex");
    },
};
var generator = exports.defaultIdentifierGenerator;
/** 替换全局主键生成器 */
function setIdentifierGenerator(next) {
    generator = next !== null && next !== void 0 ? next : exports.defaultIdentifierGenerator;
}
function getIdentifierGenerator() {
    return generator;
}
