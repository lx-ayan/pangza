"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isInternalIp = isInternalIp;
exports.normalizeIp = normalizeIp;
exports.getClientIp = getClientIp;
exports.resolveIpAddress = resolveIpAddress;
var ip2region_1 = require("ip2region");
var config_1 = require("@pangza/core/config");
var Logger_1 = require("@pangza/core/Logger");
var log = (0, Logger_1.getLogger)("OperLog.IP");
var searcher = null;
function getSearcher() {
    if (!searcher) {
        // 包内自带库；关闭 IPv6 降低内存
        searcher = new ip2region_1.default({ disableIpv6: true });
    }
    return searcher;
}
/** 是否内网 / 本机 */
function isInternalIp(ip) {
    var v = normalizeIp(ip);
    if (!v)
        return true;
    if (v === "127.0.0.1" || v === "localhost" || v === "0.0.0.0")
        return true;
    if (v.startsWith("10."))
        return true;
    if (v.startsWith("192.168."))
        return true;
    if (v.startsWith("169.254."))
        return true;
    var m = v.match(/^172\.(\d+)\./);
    if (m) {
        var n = Number(m[1]);
        if (n >= 16 && n <= 31)
            return true;
    }
    return false;
}
/** 规范化：去掉 IPv6 映射前缀、方括号 */
function normalizeIp(ip) {
    var v = String(ip || "").trim();
    if (!v)
        return "";
    if (v.startsWith("[") && v.endsWith("]")) {
        v = v.slice(1, -1);
    }
    if (v.startsWith("::ffff:")) {
        v = v.slice(7);
    }
    if (v === "::1")
        return "127.0.0.1";
    // 去掉端口（极少见）
    if (/^\d+\.\d+\.\d+\.\d+:\d+$/.test(v)) {
        v = v.split(":")[0];
    }
    return v;
}
function pickFromHeader(raw) {
    if (typeof raw === "string" && raw.trim()) {
        // x-forwarded-for: client, proxy1, proxy2 — 取最左侧客户端
        var first = raw.split(",")[0].trim();
        return normalizeIp(first);
    }
    if (Array.isArray(raw) && raw.length > 0) {
        return normalizeIp(String(raw[0]));
    }
    return "";
}
function socketIp(req) {
    var _a, _b;
    var candidates = [
        req.ip,
        (_a = req.socket) === null || _a === void 0 ? void 0 : _a.remoteAddress,
        (_b = req.connection) === null || _b === void 0 ? void 0 : _b.remoteAddress,
    ];
    for (var _i = 0, candidates_1 = candidates; _i < candidates_1.length; _i++) {
        var raw = candidates_1[_i];
        if (typeof raw === "string" && raw.trim()) {
            var ip = normalizeIp(raw);
            if (ip)
                return ip;
        }
    }
    return "";
}
/**
 * 从请求解析客户端 IP。
 * - `server.trustProxy: false`（默认）：只用直连 socket / Express req.ip，忽略转发头，防伪造绕过限流。
 * - `server.trustProxy: true`：优先读 X-Forwarded-For / X-Real-IP 等（须前面有可信反代）。
 * @param options.trustProxy 覆盖全局配置（测试用）
 */
function getClientIp(req, options) {
    var _a;
    var useProxy = (_a = options === null || options === void 0 ? void 0 : options.trustProxy) !== null && _a !== void 0 ? _a : config_1.trustProxy;
    if (useProxy) {
        var forwarded = [
            req.headers["x-forwarded-for"],
            req.headers["x-real-ip"],
            req.headers["cf-connecting-ip"],
            req.headers["x-client-ip"],
        ];
        for (var _i = 0, forwarded_1 = forwarded; _i < forwarded_1.length; _i++) {
            var raw = forwarded_1[_i];
            var ip = pickFromHeader(raw);
            if (ip)
                return ip;
        }
    }
    return socketIp(req);
}
/** 离线解析 IP 归属地（内网返回「内网IP」） */
function resolveIpAddress(ip) {
    var v = normalizeIp(ip);
    if (!v)
        return "";
    if (isInternalIp(v))
        return "内网IP";
    try {
        var res = getSearcher().search(v);
        if (!res)
            return "未知";
        var parts = [res.country, res.province, res.city, res.isp]
            .map(function (s) { return String(s || "").trim(); })
            .filter(function (s) { return s && s !== "0"; });
        // 去重：省市区可能重复
        var uniq = [];
        for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
            var p = parts_1[_i];
            if (!uniq.includes(p))
                uniq.push(p);
        }
        return uniq.join(" ") || "未知";
    }
    catch (e) {
        log.warn({ err: e, ip: v }, "IP 归属地解析失败");
        return "未知";
    }
}
