/* eslint-disable @typescript-eslint/no-empty-function */
import { ILog, LogLevel } from '../log/interfaces/i.log';

export class NoopLogger implements ILog {
  public info(message: string, data?: any): void {}
  public warn(message: string, data?: any): void {}
  public error(message: string, data?: any): void {}
  public debug(message: string, data?: any): void {}
  public verbose(message: string, data?: any): void {}
  public verboseJSON(message: string, data: any): void {}
  public willLog(level: LogLevel): boolean {
    return false;
  }
}
