"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AESUtil = void 0;
var crypto_1 = require("crypto");
/**
 * AES 加解密（ECB + PKCS7，对齐 Java AESUtil / CryptoJS）
 * key 为 16 字节 UTF-8 字符串（非 Base64）
 */
exports.AESUtil = {
    encrypt: function (plainText, key) {
        var keyBuf = Buffer.from(key, "utf8");
        if (keyBuf.length !== 16) {
            throw new Error("AES 密钥长度必须为 16 字节");
        }
        var cipher = crypto_1.default.createCipheriv("aes-128-ecb", keyBuf, null);
        cipher.setAutoPadding(true);
        var encrypted = Buffer.concat([
            cipher.update(Buffer.from(plainText, "utf8")),
            cipher.final(),
        ]);
        return encrypted.toString("base64");
    },
    decrypt: function (cipherText, key) {
        var keyBuf = Buffer.from(key, "utf8");
        if (keyBuf.length !== 16) {
            throw new Error("AES 密钥长度必须为 16 字节");
        }
        var decipher = crypto_1.default.createDecipheriv("aes-128-ecb", keyBuf, null);
        decipher.setAutoPadding(true);
        var decrypted = Buffer.concat([
            decipher.update(Buffer.from(cipherText, "base64")),
            decipher.final(),
        ]);
        return decrypted.toString("utf8");
    },
};
