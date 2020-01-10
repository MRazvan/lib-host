import { LogLevel } from './i.log';

export class LogEntry {
  public level: LogLevel;
  public ctx: string;
  public time: number;
  public message: string;
  public data: any;
}

export interface ILogImplementation {
  log(entry: LogEntry): void;
}
