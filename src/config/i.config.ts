export interface IConfig {
  get<T>(path: string, defaultValue?: T): T;
  value<T>(): T;
}

export interface IRootConfig extends IConfig {
  scope(path: string): IConfig;
}
