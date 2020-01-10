import { EventEmitter } from 'events';
import { inject, injectable } from 'inversify';
import { defaultsDeep } from 'lodash';
import { RootConfig } from './config.root';

@injectable()
export class ConfigBuilder extends EventEmitter {
  @inject(RootConfig)
  private readonly _rootConfig: RootConfig;

  private _data: any = {};
  private readonly _models: any[] = [];

  public addJson(model: Record<string, any>): ConfigBuilder {
    this._models.push(model);
    return this;
  }

  public addEnvironment(): ConfigBuilder {
    this._models.push({
      env: process.env
    });
    return this;
  }

  public build(): void {
    this._data = defaultsDeep({}, ...this._models.reverse());
    this._rootConfig.setData(this._data);
    this.emit('changed', this);
  }
}
