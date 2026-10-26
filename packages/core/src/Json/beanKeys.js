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
exports.addBeanKey = addBeanKey;
exports.getBeanKeys = getBeanKeys;
/**
 * 类字段名注册表：供 convert / 序列化发现目标属性。
 * 各属性装饰器（@JsonFormat / @JsonInclude / @JsonProperty / 校验注解）写入。
 */
var beanKeys = new WeakMap();
function addBeanKey(ctor, property) {
    var set = beanKeys.get(ctor);
    if (!set) {
        set = new Set();
        beanKeys.set(ctor, set);
    }
    set.add(property);
}
function getBeanKeys(ctor) {
    var own = beanKeys.get(ctor);
    var keys = new Set(own ? __spreadArray([], own, true) : []);
    // 继承父类声明的字段
    var proto = Object.getPrototypeOf(ctor.prototype);
    while (proto && proto !== Object.prototype) {
        var parentCtor = proto.constructor;
        var parentKeys = beanKeys.get(parentCtor);
        if (parentKeys) {
            for (var _i = 0, parentKeys_1 = parentKeys; _i < parentKeys_1.length; _i++) {
                var k = parentKeys_1[_i];
                keys.add(k);
            }
        }
        proto = Object.getPrototypeOf(proto);
    }
    return __spreadArray([], keys, true);
}
