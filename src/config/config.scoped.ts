import { trim } from 'lodash';
import { IConfig } from './i.config';

export class ScopedConfig implements IConfig {
  private readonly _path: string;

  constructor(path: string, private readonly _rootConfig: IConfig) {
    this._path = path;
  }

  public get<T>(path: string, defaultValue?: T): T {
    return this._rootConfig.get<T>(this._getConfigPath(path), defaultValue);
  }

  public value<T>(): T {
    return this.get<T>('');
  }

  public scope(path: string): IConfig {
    return new ScopedConfig(path, this);
  }

  private _getConfigPath(path: string): string {
    return trim(`${this._path}.${path}`, '.');
  }

  public getNumber(path: string, defaultValue?: number): number {
    return this._rootConfig.getNumber(this._getConfigPath(path), defaultValue);
  }

  public getString(path: string, defaultValue?: string): string {
    return this._rootConfig.getString(this._getConfigPath(path), defaultValue);
  }

  public getBool(path: string, defaultValue?: boolean): boolean {
    return this._rootConfig.getBool(this._getConfigPath(path), defaultValue);
  }
}
