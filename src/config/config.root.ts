import { EventEmitter } from 'events';
import { injectable } from 'inversify';
import { defaultsDeep, get, isEmpty, isNil } from 'lodash';
import { ILog } from '../log/interfaces/i.log';
import { ScopedConfig } from './config.scoped';
import { IConfig } from './i.config';
import { NoopLogger } from './noop.logger';

@injectable()
export class RootConfig extends EventEmitter implements IConfig {
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
    this.emit('changed', this);
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

  public getNumber(path: string, defaultValue?: number): number {
    const val = this.get<unknown>(path, defaultValue);
    if (isNil(val)) {
      return defaultValue;
    }

    if (typeof val === 'number') {
      return val;
    }
    const number = parseFloat(val + '');
    if (isNaN(number)) {
      return defaultValue;
    }
    return number;
  }

  public getString(path: string, defaultValue?: string): string {
    const val = this.get<unknown>(path, defaultValue);
    if (isNil(val)) {
      return defaultValue;
    }
    return '' + val;
  }

  public getBool(path: string, defaultValue?: boolean): boolean {
    const val = this.get<unknown>(path, defaultValue);
    if (isNil(val)) {
      return defaultValue;
    }
    const str = val.toString();
    switch (str.toLowerCase().trim()) {
      case 'true':
      case 'yes':
      case '1':
        return true;
      case 'false':
      case 'no':
      case '0':
        return false;
      default:
        return Boolean(str);
    }
  }
}
