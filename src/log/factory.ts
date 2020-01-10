import { inject, injectable } from 'inversify';
import { RootConfig } from '../config/config.root';
import { ILog } from './interfaces/i.log';
import { Log } from './log';

@injectable()
export class LogFactory {
  constructor(@inject(RootConfig) private readonly _rootConfig: RootConfig) {}
  public createLog(ctx: string): ILog {
    return new Log(ctx, this._rootConfig);
  }
}
