import { injectable } from 'inversify';
import { isEmpty, isNil } from 'lodash';
import * as moment from 'moment';
import { RootConfig } from '../../config/config.root';
import { IConfig } from '../../config/i.config';
import { LevelToString, LogLevel } from '../interfaces/i.log';
import { ILogImplementation, LogEntry } from '../interfaces/i.log.implementation';

@injectable()
export class ConsoleLog implements ILogImplementation {
  private readonly _scopedConfig: IConfig;
  private readonly _enabled: boolean = true;
  constructor(_rootConfig: RootConfig) {
    this._scopedConfig = _rootConfig.scope('log.loggers.console');
    // Set the initial state
    this._enabled = this._scopedConfig.get<boolean>('enabled', true);
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
    if (!isNil(dataMessage) && !isEmpty(dataMessage)) {
      console.log(
        `${color}[${moment(entry.time).format('YYYY-MM-DD HH:mm:ss.SSS')}][${LevelToString[entry.level]}] ${
          entry.ctx
        } - ${entry.message} ${dataMessage}${resetColor}`
      );
    } else {
      console.log(
        `${color}[${moment(entry.time).format('YYYY-MM-DD HH:mm:ss.SSS')}][${LevelToString[entry.level]}] ${
          entry.ctx
        } - ${entry.message}${resetColor}`
      );
    }
  }
}
