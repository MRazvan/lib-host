export interface IConfig {
  get<T>(path: string, defaultValue?: T): T;
  getNumber(path: string, defaultValue?: number): number;
  getString(path: string, defaultValue?: string): string;
  getBool(path: string, defaultValue?: boolean): boolean;
  value<T>(): T;
  scope(path: string): IConfig;
}
