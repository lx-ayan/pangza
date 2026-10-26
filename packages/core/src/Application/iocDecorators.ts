import "reflect-metadata";
import { inject } from "inversify";
import { registerBeansFromComponent, type BeanToken } from "./bean";
import { Container, type Ctor } from "./container";
import { MAPPER_DELEGATE_METHODS } from "./iocTypes";

const MAPPER_BEAN_KEY = Symbol.for("pangza.service.mapperBean");

/**
 * 构造器注入（Inversify `@inject`），Token 为类 / 字符串 / Symbol。
 *
 * @example
 * constructor(@Inject(UserService) private mapper: UserService) {}
 * constructor(@Inject("uploadPath") private path: string) {}
 */
export const Inject = inject;

/**
 * @Component() / @Component("alias")
 * 按「类」注册到容器；可选字符串别名（仅定时任务等）。
 * 类上的 @Bean 工厂方法返回值也会注册进容器。
 *
 * @example
 * @Component()
 * class FileService {}
 *
 * @Component("sysLogCleanTask")
 * class SysLogCleanTask { execute() {} }
 */
export function Component(alias?: string): ClassDecorator {
  return (ctor) => {
    const Ctor = ctor as unknown as Ctor;
    Container.bindClass(Ctor);
    if (alias?.trim()) {
      Container.bindAlias(alias.trim(), Ctor);
    }
    registerBeansFromComponent(Ctor);
  };
}

/**
 * @Resource(Type | "name" | symbol)
 * 属性懒注入：类单例，或 @Bean 注册的常量。
 *
 * @example
 * @Resource(UserService)
 * private userService!: UserService;
 *
 * @Resource("uploadPath")
 * private uploadPath!: string;
 */
export function Resource(type: BeanToken): PropertyDecorator {
  return (target, propertyKey) => {
    if (
      typeof type !== "function" &&
      typeof type !== "string" &&
      typeof type !== "symbol"
    ) {
      throw new Error(
        `@Resource 请传入类或字符串 Token，属性: ${String(propertyKey)}`,
      );
    }

    // 类 Token 交给 Inversify 属性注入；字符串/Symbol 仅用懒 getter
    if (typeof type === "function") {
      const applyInject = inject(type) as PropertyDecorator;
      applyInject(target, propertyKey);
    }

    const key = String(propertyKey);
    Object.defineProperty(target, key, {
      get() {
        const own = Object.prototype.hasOwnProperty.call(this, key)
          ? (this as Record<string, unknown>)[key]
          : undefined;
        if (own !== undefined) return own;
        return Container.get(type as Ctor);
      },
      set(value: unknown) {
        Object.defineProperty(this, key, {
          value,
          writable: true,
          enumerable: true,
          configurable: true,
        });
      },
      enumerable: true,
      configurable: true,
    });
  };
}

/**
 * @Service() / @Service(MapperClass)
 * - 无参：与 @Component() 相同，仅按类注册到容器
 * - 传入 Mapper：委托 Mapper CRUD / 自定义方法，并注册到容器
 *
 * @example
 * @Service()
 * class OrderAppService {}
 *
 * @Service(UserMapper)
 * class UserService {
 *   @Resource(UserRoleMapper)
 *   private userRoleMapper!: UserRoleMapper;
 * }
 */
export function Service(MapperClass?: Ctor): ClassDecorator {
  return (ctor) => {
    const Ctor = ctor as unknown as Ctor;

    if (!MapperClass) {
      Container.bindClass(Ctor);
      registerBeansFromComponent(Ctor);
      return;
    }

    (Ctor as any)[MAPPER_BEAN_KEY] = MapperClass;

    for (const method of MAPPER_DELEGATE_METHODS) {
      (Ctor as any).prototype[method] = function (...args: unknown[]) {
        const mapper = resolveMapper(this, MapperClass);
        const fn = (mapper as any)[method];
        if (typeof fn !== "function") {
          throw new Error(`[Service] Mapper 缺少方法: ${method}`);
        }
        return fn.apply(mapper, args);
      };
    }

    for (const key of Object.getOwnPropertyNames(MapperClass.prototype)) {
      if (key === "constructor") continue;
      if ((MAPPER_DELEGATE_METHODS as readonly string[]).includes(key)) {
        continue;
      }
      const desc = Object.getOwnPropertyDescriptor(MapperClass.prototype, key);
      if (!desc || typeof desc.value !== "function") continue;
      (Ctor as any).prototype[key] = function (...args: unknown[]) {
        const mapper = resolveMapper(this, MapperClass);
        return (mapper as any)[key](...args);
      };
    }

    Container.bindClass(Ctor);
  };
}

/** Service 内解析关联 Mapper：优先容器按类获取 */
function resolveMapper(serviceInstance: object, MapperClass: Ctor): object {
  const cached = (serviceInstance as any).__mapper;
  if (cached) return cached;

  let mapper: object;
  if (Container.has(MapperClass)) {
    mapper = Container.get(MapperClass);
  } else {
    Container.bindClass(MapperClass);
    mapper = Container.get(MapperClass);
  }
  (serviceInstance as any).__mapper = mapper;
  return mapper;
}
