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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisStore = exports.MemoryStore = void 0;
exports.getSessionStore = getSessionStore;
exports.setSessionStore = setSessionStore;
/**
 * 内存会话仓库。
 * - tokenMap：token -> 会话
 * - loginIdMap：loginId -> token 集合
 */
var MemoryStore = /** @class */ (function () {
    function MemoryStore() {
        this.tokenMap = new Map();
        this.loginIdMap = new Map();
    }
    MemoryStore.prototype.set = function (session) {
        return __awaiter(this, void 0, void 0, function () {
            var key, tokens;
            return __generator(this, function (_a) {
                this.tokenMap.set(session.token, session);
                key = String(session.loginId);
                tokens = this.loginIdMap.get(key);
                if (!tokens) {
                    tokens = new Set();
                    this.loginIdMap.set(key, tokens);
                }
                tokens.add(session.token);
                return [2 /*return*/];
            });
        });
    };
    MemoryStore.prototype.getByToken = function (token) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                return [2 /*return*/, (_a = this.tokenMap.get(token)) !== null && _a !== void 0 ? _a : null];
            });
        });
    };
    MemoryStore.prototype.removeByToken = function (token) {
        return __awaiter(this, void 0, void 0, function () {
            var session, key, tokens;
            return __generator(this, function (_a) {
                session = this.tokenMap.get(token);
                if (!session)
                    return [2 /*return*/];
                this.tokenMap.delete(token);
                key = String(session.loginId);
                tokens = this.loginIdMap.get(key);
                if (tokens) {
                    tokens.delete(token);
                    if (tokens.size === 0)
                        this.loginIdMap.delete(key);
                }
                return [2 /*return*/];
            });
        });
    };
    MemoryStore.prototype.removeByLoginId = function (loginId) {
        return __awaiter(this, void 0, void 0, function () {
            var key, tokens, _i, _a, token;
            return __generator(this, function (_b) {
                key = String(loginId);
                tokens = this.loginIdMap.get(key);
                if (!tokens)
                    return [2 /*return*/];
                for (_i = 0, _a = __spreadArray([], tokens, true); _i < _a.length; _i++) {
                    token = _a[_i];
                    this.tokenMap.delete(token);
                }
                this.loginIdMap.delete(key);
                return [2 /*return*/];
            });
        });
    };
    MemoryStore.prototype.listTokensByLoginId = function (loginId) {
        return __awaiter(this, void 0, void 0, function () {
            var tokens;
            return __generator(this, function (_a) {
                tokens = this.loginIdMap.get(String(loginId));
                return [2 /*return*/, tokens ? __spreadArray([], tokens, true) : []];
            });
        });
    };
    MemoryStore.prototype.touch = function (session) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.tokenMap.set(session.token, session);
                return [2 /*return*/];
            });
        });
    };
    return MemoryStore;
}());
exports.MemoryStore = MemoryStore;
/**
 * Redis 会话仓库（优先使用）。
 * key：
 * - auth:token:{token} -> AuthSession JSON + TTL
 * - auth:uid:{loginId} -> token 集合
 */
var RedisStore = /** @class */ (function () {
    function RedisStore(redis) {
        this.redis = redis;
    }
    RedisStore.prototype.tokenKey = function (token) {
        return "auth:token:".concat(token);
    };
    RedisStore.prototype.uidKey = function (loginId) {
        return "auth:uid:".concat(loginId);
    };
    RedisStore.prototype.ttlSeconds = function (session) {
        if (session.expireTime >= Number.MAX_SAFE_INTEGER / 2) {
            // 永不过期：不设 TTL（或很长）
            return undefined;
        }
        return Math.max(1, Math.ceil((session.expireTime - Date.now()) / 1000));
    };
    /**
     * uid set 需要过期，否则 token key 过期后 set 残留幽灵 member。
     * 多端登录时只延长、不缩短（取 max(当前剩余, 本次 ttl)）。
     */
    RedisStore.prototype.refreshUidExpire = function (loginId, ttl) {
        return __awaiter(this, void 0, void 0, function () {
            var key, left;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (ttl == null || !this.redis.expire)
                            return [2 /*return*/];
                        key = this.uidKey(loginId);
                        if (!this.redis.ttl) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.redis.ttl(key)];
                    case 1:
                        left = _a.sent();
                        if (left === -1)
                            return [2 /*return*/]; // 已是永不过期（永不过期会话）
                        if (left > ttl)
                            return [2 /*return*/];
                        _a.label = 2;
                    case 2: return [4 /*yield*/, this.redis.expire(key, ttl)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    RedisStore.prototype.set = function (session) {
        return __awaiter(this, void 0, void 0, function () {
            var ttl, uidKey;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ttl = this.ttlSeconds(session);
                        return [4 /*yield*/, this.redis.setJSON(this.tokenKey(session.token), session, ttl)];
                    case 1:
                        _a.sent();
                        uidKey = this.uidKey(session.loginId);
                        return [4 /*yield*/, this.redis.sAdd(uidKey, session.token)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.refreshUidExpire(session.loginId, ttl)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    RedisStore.prototype.getByToken = function (token) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.redis.getJSON(this.tokenKey(token))];
            });
        });
    };
    RedisStore.prototype.removeByToken = function (token) {
        return __awaiter(this, void 0, void 0, function () {
            var session;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.redis.getJSON(this.tokenKey(token))];
                    case 1:
                        session = _a.sent();
                        return [4 /*yield*/, this.redis.del(this.tokenKey(token))];
                    case 2:
                        _a.sent();
                        if (!session) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.redis.sRem(this.uidKey(session.loginId), token)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 清理 uid set 中 token key 已不存在的幽灵 member（TTL 竞态或旧数据）。
     * @returns 仍有效的 token 列表
     */
    RedisStore.prototype.pruneUidTokens = function (loginId) {
        return __awaiter(this, void 0, void 0, function () {
            var key, tokens, alive, ghosts, _i, tokens_1, token, session;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        key = this.uidKey(loginId);
                        return [4 /*yield*/, this.redis.sMembers(key)];
                    case 1:
                        tokens = _b.sent();
                        if (!tokens.length)
                            return [2 /*return*/, []];
                        alive = [];
                        ghosts = [];
                        _i = 0, tokens_1 = tokens;
                        _b.label = 2;
                    case 2:
                        if (!(_i < tokens_1.length)) return [3 /*break*/, 5];
                        token = tokens_1[_i];
                        return [4 /*yield*/, this.redis.getJSON(this.tokenKey(token))];
                    case 3:
                        session = _b.sent();
                        if (session)
                            alive.push(token);
                        else
                            ghosts.push(token);
                        _b.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5:
                        if (!ghosts.length) return [3 /*break*/, 7];
                        return [4 /*yield*/, (_a = this.redis).sRem.apply(_a, __spreadArray([key], ghosts, false))];
                    case 6:
                        _b.sent();
                        _b.label = 7;
                    case 7:
                        if (!(alive.length === 0)) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.redis.del(key)];
                    case 8:
                        _b.sent();
                        _b.label = 9;
                    case 9: return [2 /*return*/, alive];
                }
            });
        });
    };
    RedisStore.prototype.removeByLoginId = function (loginId) {
        return __awaiter(this, void 0, void 0, function () {
            var key, tokens;
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        key = this.uidKey(loginId);
                        return [4 /*yield*/, this.pruneUidTokens(loginId)];
                    case 1:
                        tokens = _b.sent();
                        if (!(tokens.length > 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, (_a = this.redis).del.apply(_a, __spreadArray(__spreadArray([], tokens.map(function (t) { return _this.tokenKey(t); }), false), [key], false))];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, this.redis.del(key)];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    RedisStore.prototype.listTokensByLoginId = function (loginId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.pruneUidTokens(loginId)];
            });
        });
    };
    RedisStore.prototype.touch = function (session) {
        return __awaiter(this, void 0, void 0, function () {
            var ttl;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ttl = this.ttlSeconds(session);
                        return [4 /*yield*/, this.redis.setJSON(this.tokenKey(session.token), session, ttl)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.refreshUidExpire(session.loginId, ttl)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return RedisStore;
}());
exports.RedisStore = RedisStore;
/** 当前生效的会话仓库，默认内存 */
var activeStore = new MemoryStore();
function getSessionStore() {
    return activeStore;
}
/** 切换会话仓库（配置了 redis 时切到 RedisStore） */
function setSessionStore(store) {
    activeStore = store;
}
