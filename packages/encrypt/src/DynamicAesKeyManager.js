"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamicAesKeyManager = void 0;
var crypto_1 = require("crypto");
var KEY_EXPIRE_MS = 300000;
var AES_KEY_LENGTH = 16;
var keyMap = new Map();
/**
 * 动态 AES 会话密钥（对齐 Java DynamicAesKeyManager）
 */
exports.DynamicAesKeyManager = {
    generateDynamicKey: function () {
        var _a;
        var aesKey = crypto_1.default.randomUUID().replace(/-/g, "").slice(0, AES_KEY_LENGTH);
        if (aesKey.length !== AES_KEY_LENGTH) {
            throw new Error("\u751F\u6210\u7684AES\u5BC6\u94A5\u957F\u5EA6\u4E0D\u7B26\u5408\u8981\u6C42\uFF1A".concat(aesKey.length));
        }
        var sessionId = crypto_1.default.randomUUID();
        var timer = setTimeout(function () {
            keyMap.delete(sessionId);
        }, KEY_EXPIRE_MS);
        (_a = timer.unref) === null || _a === void 0 ? void 0 : _a.call(timer);
        keyMap.set(sessionId, { key: aesKey, timer: timer });
        return {
            sessionId: sessionId,
            aesKey: Buffer.from(aesKey, "utf8").toString("base64"),
        };
    },
    getAesKeyBySessionId: function (sessionId) {
        var entry = keyMap.get(sessionId);
        if (!entry) {
            throw new Error("密钥已过期或不存在");
        }
        if (entry.key.length !== AES_KEY_LENGTH) {
            throw new Error("存储的AES密钥长度异常");
        }
        return entry.key;
    },
    removeKey: function (sessionId) {
        var entry = keyMap.get(sessionId);
        if (entry) {
            clearTimeout(entry.timer);
            keyMap.delete(sessionId);
        }
    },
};
