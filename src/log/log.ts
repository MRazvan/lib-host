import { isNil } from 'lodash';
import { IConfig } from '../config/i.config';
import { ILog, LevelFromString, LogLevel } from './interfaces/i.log';
import { LogManager } from './manager';

export class Log implements ILog {
  private _level: LogLevel;
  private readonly _scopedConfig: IConfig;

  constructor(private readonly _ctx: string, _rootConfig: IConfig) {
    this._scopedConfig = _rootConfig.scope('log');
    this._updateFromConfig();
  }

  public info(message: string, data?: any): void {
    this._doLog(LogLevel.Info, message, data);
  }

  public warn(message: string, data?: any): void {
    this._doLog(LogLevel.Warn, message, data);
  }

  public error(message: string, data?: any): void {
    this._doLog(LogLevel.Error, message, data);
  }

  public debug(message: string, data?: any): void {
    this._doLog(LogLevel.Debug, message, data);
  }

  public verbose(message: string, data?: any): void {
    this._doLog(LogLevel.Verbose, message, data);
  }

  public verboseJSON(message: string, data: any): void {
    if (this.willLog(LogLevel.Verbose)) {
      if (isNil(data)) {
        this._doLog(LogLevel.Verbose, `${message} - null or undefined`);
      } else {
        this._doLog(LogLevel.Verbose, `${message} ${JSON.stringify(data)}`);
      }
    }
  }

  public willLog(level: LogLevel): boolean {
    return this._level >= level;
  }

  private _doLog(level: LogLevel, message: string, data?: any): void {
    if (!this.willLog(level)) {
      return;
    }
    LogManager.log(level, this._ctx, message, data);
  }

  private _updateFromConfig(): void {
    const ctxLevel = this._scopedConfig.get<string>(
      // Get the ctx log level if it exists
      `instances.${this._ctx}`,
      // If not return the global log level
      this._scopedConfig.get<string>('level')
    );
    // Set the level for this logger
    this._level = LevelFromString(ctxLevel || 'none');
  }
}
