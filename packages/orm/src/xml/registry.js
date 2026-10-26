"use strict";
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
exports.clearXmlRegistry = clearXmlRegistry;
exports.getXmlNamespace = getXmlNamespace;
exports.listXmlNamespaces = listXmlNamespaces;
exports.registerXmlBundle = registerXmlBundle;
exports.getXmlStatement = getXmlStatement;
exports.getXmlFragments = getXmlFragments;
exports.countXmlStatements = countXmlStatements;
var namespaces = new Map();
function clearXmlRegistry() {
    namespaces.clear();
}
function getXmlNamespace(namespace) {
    return namespaces.get(namespace);
}
function listXmlNamespaces() {
    return __spreadArray([], namespaces.keys(), true);
}
function registerXmlBundle(namespace, sourceFile, fragments, statements) {
    var bundle = namespaces.get(namespace);
    if (!bundle) {
        bundle = {
            namespace: namespace,
            fragments: new Map(),
            statements: new Map(),
            files: [],
        };
        namespaces.set(namespace, bundle);
    }
    bundle.files.push(sourceFile);
    for (var _i = 0, fragments_1 = fragments; _i < fragments_1.length; _i++) {
        var _a = fragments_1[_i], id = _a[0], nodes = _a[1];
        if (bundle.fragments.has(id)) {
            throw new Error("XML \u91CD\u590D <sql id=\"".concat(id, "\">\uFF08namespace=").concat(namespace, ", file=").concat(sourceFile, "\uFF09"));
        }
        bundle.fragments.set(id, nodes);
    }
    for (var _b = 0, statements_1 = statements; _b < statements_1.length; _b++) {
        var stmt = statements_1[_b];
        if (bundle.statements.has(stmt.id)) {
            throw new Error("XML \u91CD\u590D\u8BED\u53E5 id=\"".concat(stmt.id, "\"\uFF08namespace=").concat(namespace, ", file=").concat(sourceFile, "\uFF09"));
        }
        bundle.statements.set(stmt.id, stmt);
    }
}
function getXmlStatement(namespace, id) {
    var _a;
    return (_a = namespaces.get(namespace)) === null || _a === void 0 ? void 0 : _a.statements.get(id);
}
function getXmlFragments(namespace) {
    var _a, _b;
    return (_b = (_a = namespaces.get(namespace)) === null || _a === void 0 ? void 0 : _a.fragments) !== null && _b !== void 0 ? _b : new Map();
}
function countXmlStatements() {
    var n = 0;
    for (var _i = 0, _a = namespaces.values(); _i < _a.length; _i++) {
        var b = _a[_i];
        n += b.statements.size;
    }
    return n;
}
