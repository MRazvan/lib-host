import { isNil } from 'lodash';

export enum LogLevel {
  None = 0,
  Error = 1,
  Warn = 2,
  Info = 3,
  Debug = 4,
  Verbose = 5
}

export const LevelToString: string[] = ['None', 'Error', 'Warn', 'Info', 'Debug', 'Verbose'];

export function LevelFromString(lvl: string): number {
  if (isNil(lvl)) {
    return 0;
  }

  for (let i = 0; i < LevelToString.length; ++i) {
    if (LevelToString[i].toLowerCase() === lvl.toLowerCase()) {
      return i;
    }
  }
  return 0;
}

export interface ILog {
  info(message: string, data?: any): void;
  warn(message: string, data?: any): void;
  error(message: string, data?: any): void;
  debug(message: string, data?: any): void;
  verbose(message: string, data?: any): void;
  verboseJSON(message: string, data: any): void;
  willLog(level: LogLevel): boolean;
}
