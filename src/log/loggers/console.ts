import { injectable } from 'inversify';
import { isNil } from 'lodash';
import * as moment from 'moment';
import { RootConfig } from '../../config/config.root';
import { IConfig } from '../../config/i.config';
import { LevelToString, LogLevel } from '../interfaces/i.log';
import { ILogImplementation, LogEntry } from '../interfaces/i.log.implementation';

@injectable()
export class ConsoleLog implements ILogImplementation {
  private readonly _scopedConfig: IConfig;
  private _enabled = true;
  private _useColor = true;
  constructor(_rootConfig: RootConfig) {
    this._scopedConfig = _rootConfig.scope('log.loggers.console');
    // Follow config change, it's safe to attach to the even since this logger
    //    will exist during the lifetime of the application
    _rootConfig.on('changed', () => {
      this._updateConfiguration();
    });
    // Read the configuration
    this._updateConfiguration();
  }

  public log(entry: LogEntry): void {
    if (!this._enabled) {
      return;
    }
    let dataMessage = null;
    if (!isNil(entry.data)) {
      if (entry.data instanceof Error) {
        dataMessage = entry.data.message + '  Stack : ' + entry.data.stack;
      } else {
        dataMessage = JSON.stringify(entry.data);
      }
    }
    const strLevel = (LevelToString[entry.level] + ''.padEnd(7)).substr(0, 7);
    const message = `[${moment(entry.time).format('YYYY-MM-DD HH:mm:ss.SSS')}][${strLevel}] ${entry.ctx} - ${
      entry.message
    } ${isNil(dataMessage) ? '' : dataMessage}`;

    if (this._useColor) {
      const resetColor = '\u001b[0m';
      let color = '\u001B[37m'; // White
      switch (entry.level) {
        case LogLevel.Error:
          color = '\u001B[91m'; // Red
          break;
        case LogLevel.Warn:
          color = '\u001B[93m'; // Yellow
          break;
        case LogLevel.Debug:
          color = '\u001B[96m'; // Cyan
          break;
        case LogLevel.Verbose:
          color = '\u001B[92m'; // Green
          break;
        default:
          break;
      }
      console.log(`${color}${message}${resetColor}`);
    } else {
      console.log(`${message}`);
    }
  }

  private _updateConfiguration(): void {
    this._enabled = this._scopedConfig.get<boolean>('enabled', true);
    this._useColor = this._scopedConfig.get<boolean>('color', true);
  }
}
