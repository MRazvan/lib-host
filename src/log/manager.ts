import { debug } from 'debug';
import { isNil } from 'lodash';
import * as moment from 'moment';
import { PartialModel } from '../utils';
import { LogLevel } from './interfaces/i.log';
import { ILogImplementation, LogEntry } from './interfaces/i.log.implementation';

const logDebug = debug('log_manager');

export class Logger extends PartialModel<Logger> {
  public logger: ILogImplementation;
  public name: string;
}

export class LogManager {
  private static readonly _loggers: Logger[] = [];

  public static addLogger(name: string, logger: ILogImplementation): void {
    const existingLogger = LogManager._loggers.find((lg: Logger) => lg.name === name);
    if (isNil(existingLogger)) {
      LogManager._loggers.push(new Logger({ name, logger }));
    }
  }

  public static getLoggers(): Logger[] {
    return LogManager._loggers;
  }

  public static log(level: LogLevel, ctx: string, message: string, data?: any): void {
    const logEntry = new LogEntry();
    logEntry.level = level;
    logEntry.ctx = ctx;
    logEntry.message = message;
    logEntry.data = data;
    logEntry.time = moment().valueOf();
    LogManager._loggers.forEach(le => {
      try {
        le.logger.log(logEntry);
      } catch (error) {
        logDebug(`Error calling log ${le.name} with payload ${JSON.stringify(logEntry)}. `);
      }
    });
  }
}
