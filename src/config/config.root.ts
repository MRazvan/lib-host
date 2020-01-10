import { injectable } from 'inversify';
import { defaultsDeep, get, isEmpty, isNil } from 'lodash';
import { ILog } from '../log/interfaces/i.log';
import { ScopedConfig } from './config.scoped';
import { IConfig, IRootConfig } from './i.config';
import { NoopLogger } from './noop.logger';

@injectable()
export class RootConfig implements IRootConfig {
  private _data: any = {};
  private _log: ILog = new NoopLogger();

  public getData(): any {
    return !isNil(this._data) ? this._data : {};
  }

  public setLogger(log: ILog): void {
    this._log = log;
  }

  public setData(data: any): void {
    this._data = defaultsDeep(data, this._data);
    this._log.info('Configuration changed');
  }

  public scope(path: string): IConfig {
    return new ScopedConfig(path, this);
  }

  public get<T>(path: string, defaultValue?: T): T {
    this._log.verbose(`Getting configuration from path '${path}'`);
    if (isNil(path) || isEmpty(path)) {
      return this._data;
    }
    const val = get(this._data, path, null);
    if (isNil(val)) {
      this._log.warn(`Configuration key '${path}' not found, returning default '${JSON.stringify(defaultValue)}'`);
      return defaultValue;
    }
    return val as T;
  }

  public value<T>(): T {
    return this.get<T>('');
  }
}
