declare module "@pangza/orm" {
  export class QueryWrapper<T = any> {
    constructor(...args: any[]);
    [key: string]: any;
  }
  export type IPage<T = any> = {
    records: T[];
    total: number;
    size: number;
    current: number;
  };
  export type PageQuery = {
    current?: number;
    size?: number;
    [k: string]: any;
  };
  export type MapperTableOptions = Record<string, any>;
  export class BaseMapper<T = any> {
    [key: string]: any;
  }
  export function table(...args: any[]): any;
  const _default: any;
  export default _default;
}
declare module "@pangza/orm/*" {
  const mod: any;
  export = mod;
}
