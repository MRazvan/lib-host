import { trim } from 'lodash';
import { IConfig, IRootConfig } from './i.config';

export class ScopedConfig implements IConfig {
  private readonly _path: string;

  constructor(path: string, private readonly _rootConfig: IRootConfig) {
    this._path = path;
  }

  public get<T>(path: string, defaultValue?: T): T {
    const configPath = trim(`${this._path}.${path}`, '.');
    return this._rootConfig.get<T>(configPath, defaultValue);
  }

  public value<T>(): T {
    return this.get<T>('');
  }
}