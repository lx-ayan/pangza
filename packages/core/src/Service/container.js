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
exports.Container = void 0;
var inversify_1 = require("inversify");
/**
 * 基于 Inversify 的 IoC 门面。
 *
 * 约定：
 * - **主标识是类**：`Container.get(UserService)` / `@Resource(UserService)`
 * - **字符串别名仅可选**：定时任务等 DB 配置的 beanName（`@Component("sysLogTask")`）
 * - 默认作用域：单例（Singleton）
 */
var AppContainer = /** @class */ (function () {
    function AppContainer() {
        /** 底层 Inversify 容器（一般业务代码用本门面即可） */
        this.raw = new inversify_1.Container({
            defaultScope: "Singleton",
        });
        /** 已绑定的类（按注册顺序，供 ApplicationInit / Destroy 扫描） */
        this.boundClasses = [];
    }
    /** 确保类带 @injectable；已装饰则忽略 */
    AppContainer.prototype.ensureInjectable = function (ctor) {
        try {
            (0, inversify_1.decorate)((0, inversify_1.injectable)(), ctor);
        }
        catch (_a) {
            // Already decorated / cannot decorate again
        }
    };
    /**
     * 按「类」绑定单例。
     * 重复 bind 同一类会跳过（扫描多次 require 安全）。
     */
    AppContainer.prototype.bindClass = function (ctor) {
        this.ensureInjectable(ctor);
        if (this.raw.isBound(ctor)) {
            return;
        }
        this.raw.bind(ctor).toSelf().inSingletonScope();
        this.boundClasses.push(ctor);
    };
    /**
     * 按类绑定单例，并在首次解析时执行 activation（如 @ConditionOnProperty 灌配置）。
     */
    AppContainer.prototype.bindClassWithActivation = function (ctor, activate) {
        this.ensureInjectable(ctor);
        if (this.raw.isBound(ctor)) {
            return;
        }
        this.raw
            .bind(ctor)
            .toSelf()
            .inSingletonScope()
            .onActivation(function (_ctx, instance) { return activate(instance); });
        this.boundClasses.push(ctor);
    };
    /** 已绑定的类列表（注册顺序） */
    AppContainer.prototype.getBoundClasses = function () {
        return __spreadArray([], this.boundClasses, true);
    };
    /**
     * 字符串别名 → 已绑定的类（同一单例）。
     * 仅用于调度任务 beanName 等必须按名字查找的场景。
     */
    AppContainer.prototype.bindAlias = function (name, ctor) {
        var key = name.trim();
        if (!key) {
            throw new Error("[Container] 别名不能为空");
        }
        this.bindClass(ctor);
        if (this.raw.isBound(key)) {
            return;
        }
        this.raw.bind(key).toService(ctor);
    };
    /**
     * 绑定常量（@Bean 工厂返回值）。
     * Token 可以是类、字符串或 Symbol。
     */
    AppContainer.prototype.bindConstant = function (id, value) {
        var key = id;
        if (this.raw.isBound(key)) {
            this.raw.rebind(key).toConstantValue(value);
            return;
        }
        this.raw.bind(key).toConstantValue(value);
    };
    /** 是否已绑定（类或别名） */
    AppContainer.prototype.has = function (id) {
        return this.raw.isBound(id);
    };
    AppContainer.prototype.get = function (id) {
        var key = id;
        if (!this.raw.isBound(key)) {
            var label = typeof id === "function" ? id.name || String(id) : String(id);
            throw new Error("[Container] \u672A\u627E\u5230\u7EC4\u4EF6: ".concat(label));
        }
        return this.raw.get(key);
    };
    /** 测试用：清空全部绑定 */
    AppContainer.prototype.clear = function () {
        this.raw.unbindAll();
        this.boundClasses.length = 0;
    };
    return AppContainer;
}());
/** 进程内唯一容器 */
exports.Container = new AppContainer();
