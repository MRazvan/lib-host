import { EventEmitter } from 'events';
import { Container, interfaces } from 'inversify';
import { defaultsDeep } from 'lodash';
import { ConfigBuilder } from './config/config.builder';
import { RootConfig } from './config/config.root';
import { Default } from './defaults';
import { LogFactory } from './log/factory';
import { ILog, LevelToString } from './log/interfaces/i.log';
import { ConsoleLog } from './log/loggers/console';
import { LogManager } from './log/manager';
import { Runnable } from './runnable/runnable';
import { PartialModel } from './utils';

export type ModuleCallback = (container: Container, host: Host, options?: any) => void | Promise<void>;

export interface IModule {
  init(container: Container, host: Host, options?: any): void | Promise<void>;
}

export class ModuleData extends PartialModel<ModuleData> {
  public appModule: IModule;
  public name: string;
  public options: any;
  public initialized = false;
}

export class RunnableInfo extends PartialModel<RunnableInfo> {
  public runnable: Runnable;
  public name: string;
  public started: boolean;
  public lastError: any;
}

export class Host extends EventEmitter {
  private readonly _modules: ModuleData[] = [];
  private _container: Container;
  private _log: ILog;
  private readonly _runnables: RunnableInfo[] = [];
  private _started = false;
  private _initialized = false;
  public config: RootConfig = null;

  constructor(containerOrOptions?: interfaces.ContainerOptions | Container) {
    super();
    if (containerOrOptions instanceof Container) {
      this._container = containerOrOptions;
    } else {
      this._container = new Container(containerOrOptions || { skipBaseClassChecks: true });
    }
    this._container
      .bind<Container>(Container)
      .toConstantValue(this._container)
      .whenTargetNamed('Root');
    this._container.bind<Host>(Host).toConstantValue(this);
  }

  public getModules(): ModuleData[] {
    return this._modules;
  }

  public getRunnables(): RunnableInfo[] {
    return this._runnables;
  }

  public getContainer(): Container {
    return this._container;
  }

  public addModule(appModule: IModule, options?: any): Host {
    const moduleData = new ModuleData({ appModule: appModule, options: options, name: appModule.constructor.name });
    this._modules.push(moduleData);
    this.emit('module.added', moduleData);
    return this;
  }

  public init(options?: any): Host {
    if (this._initialized) {
      return this;
    }
    // Bind our services
    // The RootConfig provider
    this._container
      .bind(RootConfig)
      .toSelf()
      .inSingletonScope();
    // The configuration builder provider
    this._container
      .bind(ConfigBuilder)
      .toSelf()
      .inSingletonScope();
    // The log factory service
    this._container
      .bind(LogFactory)
      .toSelf()
      .inSingletonScope();

    const configBuilder = this._container.get<ConfigBuilder>(ConfigBuilder);
    // Set the options in the cofiguration and add the log defaults if we don't set anything else in the options
    configBuilder
      .addJson(
        defaultsDeep(options || {}, {
          log: {
            level: LevelToString[Default.LogLevel],
            loggers: {
              console: {
                enabled: Default.ConsoleLoggerEnabled
              }
            }
          }
        })
      )
      .addEnvironment()
      .build();

    // Initialize the logger
    this.config = this._container.get<RootConfig>(RootConfig);
    const disableDefault = this.config.get<boolean>('log.disable_default', false);
    if (!disableDefault) {
      LogManager.addLogger('console', new ConsoleLog(this.config));
    }
    // Now set a logger for the configuration provider
    const logFactory = this._container.get<LogFactory>(LogFactory);
    this.config.setLogger(logFactory.createLog('Config'));

    // Set a logger for us
    this._log = logFactory.createLog('Host');
    this._initialized = true;
    this.emit('initialized', this);
    // And we are done
    return this;
  }

  public async start(options?: any): Promise<void> {
    // If we already started don't do it again
    if (this._started) {
      return;
    }
    this.init(options);

    const configBuilder = this._container.get<ConfigBuilder>(ConfigBuilder);
    // Set the options in the cofiguration and add the log defaults if we don't set anything else in the options
    configBuilder.addJson(options).build();
    // For a start initialize all modules
    for (let idx = 0; idx < this._modules.length; ++idx) {
      const entry: ModuleData = this._modules[idx];
      // Call init on the module
      if (entry.initialized) {
        continue;
      }

      const result = entry.appModule.init(this._container, this, defaultsDeep(options || {}, entry.options));
      try {
        if (result instanceof Promise) {
          await result;
        }
        entry.initialized = true;
        this.emit('module.initialied', entry.appModule);
      } catch (error) {
        this._log.error(`Error initializing module ${entry.appModule.constructor.name}.`, error);
        this.emit('module.failed', entry.appModule);
      }
    }

    // Check the container to see if the modules registered any runnables
    //    and get all runnables if we have
    if (this._container.isBound(Runnable)) {
      const runnables: Runnable[] = this._container.getAll<Runnable>(Runnable);
      // For each runnable create something to track them by
      runnables.forEach((runnable: Runnable) => {
        this._runnables.push(
          new RunnableInfo({
            runnable: runnable,
            lastError: null,
            name: runnable.constructor.name,
            started: false
          })
        );
      });
      this._log.info(`Found ${runnables.length} runnables.`);
      this.emit('runnables', this._runnables);
    }

    // Try and call 'start' and 'allStarted' on them
    const runnablesToStop: RunnableInfo[] = [];
    for (let idx = 0, total = this._runnables.length; idx < total; ++idx) {
      const entry = this._runnables[idx];
      this._log.debug(` -> Starting runnable '${entry.name}'.`);
      try {
        await entry.runnable.start();
        entry.started = true;
        this.emit('runnable.started', entry);
      } catch (error) {
        entry.started = false;
        entry.lastError = error;
        this._log.error(` -> Error starting runnable '${entry.name}'`, error);
        this.emit('runnable.failed', entry, error);
      }
    }

    for (let idx = 0, total = this._runnables.length; idx < total; ++idx) {
      const entry = this._runnables[idx];
      if (!entry.started) {
        // Something happened and this runnable has not started
        continue;
      }
      // Call allStarted on this runnable
      this._log.debug(` -> All Started '${entry.name}'.`);
      try {
        await entry.runnable.allStarted();
        this.emit('runnable.allStarted', entry);
      } catch (error) {
        // Something happend when calling all started, we need to 'stop' this runnable since start was already called
        entry.lastError = error;
        runnablesToStop.push(entry);
        this._log.error(` -> Error calling allStarted on runnable '${entry.name}'`, error);
        this.emit('runnable.failed', entry, error);
      }
    }
    this._started = true;
    const stopFailed = this._stop(runnablesToStop);
    this.emit('start', this);
    return stopFailed;
  }

  public stop(): Promise<void> {
    const stopped = this._stop(this._runnables).then(() => {
      this._container = null;
      this._started = false;
    });
    this.emit('stop');
    return stopped;
  }

  private async _stop(runnablesToStop: RunnableInfo[]): Promise<void> {
    // Now stop all the runnables
    for (let idx = 0, total = runnablesToStop.length; idx < total; ++idx) {
      const entry = runnablesToStop[idx];
      if (!entry.started) {
        continue;
      }

      this._log.debug(` -> Stopping runnable '${entry.name}'.`);
      try {
        await entry.runnable.stop();
        this.emit('runnable.stop', entry);
      } catch (error) {
        entry.lastError = error;
        this._log.error(` -> Error stoping runnable '${entry.constructor.name}'`, error);
        this.emit('runnable.failed', entry, error);
      }
    }

    // And finally call allStopped
    for (let idx = 0, total = runnablesToStop.length; idx < total; ++idx) {
      const entry = runnablesToStop[idx];
      if (!entry.started) {
        continue;
      }

      this._log.debug(` -> All Stopped '${entry.constructor.name}'.`);
      try {
        await entry.runnable.allStopped();
        entry.started = false;
        this.emit('runnable.allStopped', entry);
      } catch (error) {
        entry.lastError = error;
        this._log.error(` -> Error calling allStopped on runnable '${entry.constructor.name}'`, error);
        this.emit('runnable.failed', entry, error);
      }
    }
  }

  public static build(appModule: ModuleCallback, options?: any): Host {
    return new Host().init().addModule(
      {
        init: appModule
      },
      options
    );
  }
}
