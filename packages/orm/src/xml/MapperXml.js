"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.MapperXml = MapperXml;
exports.getMapperXmlNamespace = getMapperXmlNamespace;
exports.markSqlMethodBound = markSqlMethodBound;
exports.isSqlMethodBound = isSqlMethodBound;
exports.bootstrapXmlMappers = bootstrapXmlMappers;
require("reflect-metadata");
var execute_1 = require("./execute");
var loadMappers_1 = require("./loadMappers");
var registry_1 = require("./registry");
var PARAM_NAMES_KEY = Symbol.for("pangza.orm.sqlParamNames");
var SQL_BOUND_KEY = Symbol.for("pangza.orm.sqlBound");
var MAPPER_XML_NS_KEY = Symbol.for("pangza.orm.mapperXmlNamespace");
var MAPPER_XML_DS_KEY = Symbol.for("pangza.orm.mapperXmlDatasource");
function getNamedParams(target, methodName) {
    var _a;
    return ((_a = Reflect.getOwnMetadata(PARAM_NAMES_KEY, target, methodName)) !== null && _a !== void 0 ? _a : {});
}
function bindMethod(proto, methodName, namespace, datasource) {
    var desc = Object.getOwnPropertyDescriptor(proto, methodName);
    if (!desc || typeof desc.value !== "function")
        return;
    if (desc.value[SQL_BOUND_KEY]) {
        throw new Error("@MapperXml \u65B9\u6CD5 ".concat(methodName, " \u5DF2\u7ED1\u5B9A @Select/@Insert \u7B49\u6CE8\u89E3\uFF0C\u4E0D\u80FD\u518D\u7ED1 XML"));
    }
    var named = function () { return getNamedParams(proto, methodName); };
    var wrapped = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var stmt;
            return __generator(this, function (_a) {
                (0, loadMappers_1.ensureXmlMappersLoaded)();
                stmt = (0, registry_1.getXmlStatement)(namespace, methodName);
                if (!stmt) {
                    throw new Error("XML \u672A\u627E\u5230\u8BED\u53E5 ".concat(namespace, ".").concat(methodName, "\uFF08\u8BF7\u68C0\u67E5 mapperLocations \u4E0E id\uFF09"));
                }
                return [2 /*return*/, (0, execute_1.executeXmlStatement)(namespace, methodName, {
                        args: args,
                        namedByIndex: named(),
                        datasource: datasource,
                    })];
            });
        });
    };
    wrapped[SQL_BOUND_KEY] = "xml";
    Object.defineProperty(proto, methodName, __assign(__assign({}, desc), { value: wrapped }));
}
/**
 * 将类方法绑定到 XML namespace（方法名 = 语句 id）。
 *
 * @example
 * @MapperXml("com.pangza.UserMapper")
 * class UserMapper {
 *   findByRole(@Param("roleId") roleId: number): Promise<any[]> {
 *     throw new Error("bound by XML");
 *   }
 * }
 */
function MapperXml(namespace, options) {
    var _a;
    var ns = String(namespace !== null && namespace !== void 0 ? namespace : "").trim();
    if (!ns)
        throw new Error("@MapperXml namespace 不能为空");
    var datasource = ((_a = options === null || options === void 0 ? void 0 : options.datasource) === null || _a === void 0 ? void 0 : _a.trim()) || undefined;
    return function (ctor) {
        var Ctor = ctor;
        Reflect.defineMetadata(MAPPER_XML_NS_KEY, ns, Ctor);
        if (datasource) {
            Reflect.defineMetadata(MAPPER_XML_DS_KEY, datasource, Ctor);
        }
        var proto = Ctor.prototype;
        for (var _i = 0, _a = Object.getOwnPropertyNames(proto); _i < _a.length; _i++) {
            var key = _a[_i];
            if (key === "constructor")
                continue;
            var desc = Object.getOwnPropertyDescriptor(proto, key);
            if (!desc || typeof desc.value !== "function")
                continue;
            bindMethod(proto, key, ns, datasource);
        }
    };
}
function getMapperXmlNamespace(ctor) {
    return Reflect.getOwnMetadata(MAPPER_XML_NS_KEY, ctor);
}
/** 标记方法已由 @Select 等绑定，供 MapperXml 冲突检测 */
function markSqlMethodBound(fn, kind) {
    if (kind === void 0) { kind = "annotation"; }
    fn[SQL_BOUND_KEY] = kind;
}
function isSqlMethodBound(fn) {
    return !!fn[SQL_BOUND_KEY];
}
/** 启动时加载 XML（若配置了 mapperLocations） */
function bootstrapXmlMappers() {
    (0, loadMappers_1.loadXmlMappers)();
}
