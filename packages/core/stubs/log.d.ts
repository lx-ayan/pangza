declare module "@pangza/log" {
  export type LogRecordOption = Record<string, any>;
  const _default: any;
  export default _default;
}
declare module "@pangza/log/*" {
  const mod: any;
  export = mod;
}
