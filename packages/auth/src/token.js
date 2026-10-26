"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateStyleToken = generateStyleToken;
exports.createAuthToken = createAuthToken;
exports.verifyAuthToken = verifyAuthToken;
var crypto_1 = require("crypto");
var jsonwebtoken_1 = require("jsonwebtoken");
/** Sa-Token 风格的随机 token 生成 */
function generateStyleToken(style) {
    switch (style) {
        case "simple-uuid":
            return (0, crypto_1.randomUUID)().replace(/-/g, "");
        case "uuid":
            return (0, crypto_1.randomUUID)();
        case "random-32":
            return (0, crypto_1.randomBytes)(16).toString("hex");
        case "random-64":
            return (0, crypto_1.randomBytes)(32).toString("hex");
        case "random-128":
            return (0, crypto_1.randomBytes)(64).toString("hex");
        case "tik": {
            // 类 Sa-Token tik：短可读风格
            var part = function () { return (0, crypto_1.randomBytes)(3).toString("hex"); };
            return "".concat(part(), "_").concat(part(), "_").concat(part());
        }
        case "jwt":
            // jwt 由 createAuthToken 用密钥签发，这里不应单独走到
            return (0, crypto_1.randomUUID)();
        default:
            return (0, crypto_1.randomUUID)();
    }
}
/**
 * 按配置生成 token（自定义 createToken > jwt > tokenStyle）。
 */
function createAuthToken(options, payload) {
    return __awaiter(this, void 0, void 0, function () {
        var expiresIn, signOptions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!options.createToken) return [3 /*break*/, 2];
                    return [4 /*yield*/, options.createToken({
                            loginId: payload.loginId,
                            device: payload.device,
                        })];
                case 1: return [2 /*return*/, _a.sent()];
                case 2:
                    if (options.tokenStyle === "jwt") {
                        expiresIn = payload.timeout < 0
                            ? undefined
                            : Math.max(1, Math.ceil(payload.timeout / 1000));
                        signOptions = {
                            algorithm: (options.jwtAlgorithm || "HS256"),
                        };
                        if (expiresIn !== undefined) {
                            signOptions.expiresIn = expiresIn;
                        }
                        return [2 /*return*/, jsonwebtoken_1.default.sign({
                                loginId: payload.loginId,
                                device: payload.device,
                            }, options.jwtSecret, signOptions)];
                    }
                    return [2 /*return*/, generateStyleToken(options.tokenStyle)];
            }
        });
    });
}
/** 校验 JWT 形态 token（非 jwt 风格直接 true） */
function verifyAuthToken(options, token) {
    if (options.tokenStyle !== "jwt" && !options.createToken) {
        return true;
    }
    if (options.tokenStyle !== "jwt") {
        return true;
    }
    try {
        jsonwebtoken_1.default.verify(token, options.jwtSecret, {
            algorithms: [(options.jwtAlgorithm || "HS256")],
        });
        return true;
    }
    catch (_a) {
        return false;
    }
}
