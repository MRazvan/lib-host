export interface IConfig {
  get<T>(path: string, defaultValue?: T): T;
  value<T>(): T;
  scope(path: string): IConfig;
}
