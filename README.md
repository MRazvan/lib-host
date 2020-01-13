# lib-host

Library for holding different functionalities that need to run in a controlled fashion and depend or provide functionalities to other functionalities.
It provides two services for all functionalities.
1. [Configuration service](#configuration)
2. [Logging service](#logging)

```typescript
class MyModule {
  public init(hostContainer: Container, host: Host, options? : Record<string, any>): void {
    // Add the configuration
    hostContainer.get<ConfigBuilder>(ConfigBuilder).addJson({ myVariable: 3000 }).build();
    // Get the configuration variable
    const myVariable = hostContainer.get<RootConfig>(RootConfig).get<number>('myVariable', 4000);
    // Create a logger
    const log = hostContainer.get<LogFactory>(LogFactory).createLog('MyModule');
    // Log some message
    log.info(`Init called. Over ${myVariable}`);
    // hostContainer.bind(Runnable).to(... some service extending Runnable)
  }
}
host.addModule(new MyModule());
    .start()
    .then(() => console.log('started'));


// Output
//  [time][Info   ] MyModule - Init called. Over 3000
```

## Host
The hosting class, this exposes methods to register different functionality providing modules. It extends EventEmitter and raises several events.

#### Methods
* *getModules()* - Return all modules registered in this host
* *getRunnables()* - Return all functionalities that need to start in a controlled fashion
* *getContainer()* - Get the host DI container.
* *addModule(module, options?)* - Method to register a module and set some options that will be sent to the 'init' method of the module when it is initialized.
* *init(options?)* - Method used to initialize the host (add the services and create the initialize configuration state by merging with the options argument)
* *start(options?)* - Method used to start all Runnables in a controlled fashion. The options argument will be merged with the module options and sent as argument to the 'init' method. It returns a promise that resolves after the host has started.

#### Events
* *start* - Event to notify when the host has actually started. Arguments :  `this`, instance of [Host](#host)
* *stop* - Event to notify when the host has stopped. Arguments : `this`, instance of [Host](#host)


#### Example
```typescript
const host = new Host();
host.addModule({
  init : (hostContainer: Container, host: Host, options? : Record<string, any>): void {
    // Do something
  }
});
// It is better / cleaner to create a module class

// The instance of MyModule created by the host will be kept during the lifetime of the host
class MyModule {
  public init(hostContainer: Container, host: Host, options? : Record<string, any>): void {}
}
host.addModule(new MyModule())

host.start().then(() => console.log('started'));
```

## Configuration
The configuration service is registered in the root DI container, and available to all functionalities.
It provides functionalities to set / update configuration data and a way to get that configuration inside the functionalities.
- [ConfigBuilder](#configbuilder)
- [RootConfig](#rootconfig)


### ConfigBuilder
Configuration build service. Service to build the data object used by the [RootConfig](#rootconfig).
It provides methods for adding configuration and setting the configuration. It extends EventEmitter and raises one event.

> **How to get**
> ```typescript
> const config = container.get<ConfigBuilder>(ConfigBuilder);
> ```

#### Methods
* *addEnvironment()* - Method used to add 'process.env' under a node named 'env'.
* *addJson({})* - Method used to add a json configuration object.
#### Events
* *changed* - Event to notify when the configuration has changed. Argument : `this`, instance of [ConfigBuilder](#configbuilder)

#### Example
```typescript
const configBuilder = container.get<ConfigBuilder>(ConfigBuilder);
configBuilder.addEnvironment(); // This will add process.env under a node named 'env'; It is added by default by the 'Host' object
configBuilder.addJson({}) // This will add any json to the configuration
configBuilder.addJson({}) // This will add any json to the configuration
configBuilder.addJson({}) // This will add any json to the configuration
configBuilder.addJson({}) // This will add any json to the configuration

configBuilder.build() // This will build the final configuration object and set it on the RootConfig
```
> **Important**
> 
> The order of adding configuration matters, it is using the 'defaultsDeep' method to aggregate all the data in reverse order of addition. The last data added will be used first, and the rest of the data will be used to augment that object with new properties.

```typescript
config.addJson({a : 'one', b: { c : 'one' }});
config.addJson({a : 'two'});
config.build();
// The resulting object will be
// {a : 'two', b : {c : 'one' }}
```
### RootConfig
Configuration provider service. It is used to retrieve configuration settings and provide an easy way to do that. It extends EventEmitter and raises one event.

> **How to get**
> ```typescript
> const rootConfig = container.get<RootConfig>(RootConfig);
> ```
#### Methods
* *get<T>(path: string, defaultValue?: T): T* - Method returning a value based on the path received, if it does not find the value it will return the default. The type 'T' is placebo since typescript does not support what we need to convert different data types to the one we need. So the 'T' is so typescript does not complain when we get the values and assign them to variables.
* *value<T>(): T* - Return the actual backing data object for the RootConfig. The one that was set by [ConfigBuilder](#configbuilder).
* *scope(path: string): IConfig* - Return a scoped path configuration object.
* *setData(data: any):void* - Method used to set the data on this instance, it is used automatically by the [ConfigBuilder](#configbuilder) when calling 'build'.
* *getData(): any* - Return the data object used by this instance.
#### Events
* *changed* - Event raised when the internal 'data' was changed for this by the [ConfigBuilder](#configbuilder). Argument : `this`, instance of [RootConfig](#rootconfig)

#### Example

```typescript
const cfgBuilder = ...;
const rootConfig = ...;

// Build the configuration
cfgBuilder.addJson(require('myConfig.json'));
cfgBuilder.addJson({
  one : {
    two : {
      three : 'three',
      three_one: 'one',
      three_two: 'two',
      four : {
        one : 'one',
        two : 'two',
      }
    }
  }
}).build();

// Get our values
const three = rootConfig.get<string>('one.two.three');
const three_one = rootConfig.get<string>('one.two.three_one');
const three_two = rootConfig.get<string>('one.two.three_two');

// It is easier if we scope the configuration provider to what we care about and use a scoped configuration
const scopedTwo = rootConfig.scope('one.two');
const three = scopedTwo.get<string>('three');
const three_one = scopedTwo.get<string>('three_one');
const three_two = scopedTwo.get<string>('three_two');

const scopedFour = scopedTwo.scope('four'); // rootConfig.scope('one.two.four');
....
```

## Logging
The library provides several functionalities to deal with logging, and it integrates that with the configuration system.

### LogManager
Registration service for different loggers, the library providers one default logger that will log to console.
#### Methods
* *replaceLogger(name: string, logger: ILogImplementation): void* - Method used to replace a log implementation, if the log implementation does not exist, the logger will just be added
* *addLogger(name: string, logger: ILogImplementation): void* - Method used to add a logger, if the logger exists, the new one will not be added
* *getLoggers(): Logger[]*  - Get all loggers registered
* *log(level: LogLevel, ctx: string, message: string, data?: any): void* - Go through all registered loggers, and ask them to log the message.

```typescript

class Logger {
  logger: ILogImplementation;
  name: string;
}

enum LogLevel {
  None = 0,
  Error = 1,
  Warn = 2,
  Info = 3,
  Debug = 4,
  Verbose = 5
}

class LogEntry {
  // Log level
  public level: LogLevel; 
  // The log name. For example 'User' or 'Home' or 'Errors' or something. 
  //   Equivalent to `debug = require('debug')(name)`
  public ctx: string; 
  // The timestamp in milliseconds of the log, got using moment.valueOf() (basically UTC)
  public time: number; 
  // The message
  public message: string; 
  // Additional data sent, it can be anything.
  public data: any; 
}

interface ILogImplementation {
  log(entry: LogEntry): void;
}
```

The LogManager will call all loggers registered in the order of addition.

> **Additional Loggers**
> 
> If we want to use `winston` we could just create a class that implements ILogImplementation and use `winston` inside that to log the messages. If we need to use `debug` we can do the same thing, or we could to all together. If we need to register to an enpoint somewhere create a new ILogImplementation implementation :).

### LogFactory
Service used to create a named log, it takes into account the log configuration set by the library or the user of the library.

#### Methods
* *createLog(ctx: string): ILog* - Create a named logger.
  
```typescript
const lf = container.get<LogFactory>(LogFactory);
const log = lf.create('MyLogger');

log.info('Hello World');
// Output:   [time][Info   ] MyLogger - Hello World
```

```typescript
interface ILog {
  info(message: string, data?: any): void;
  warn(message: string, data?: any): void;
  error(message: string, data?: any): void;
  debug(message: string, data?: any): void;
  verbose(message: string, data?: any): void;
  verboseJSON(message: string, data: any): void;
  willLog(level: LogLevel): boolean;
}
```

### Configuration support

The log system has several levels of configuration support.
```js
{
  log: {
    level : 'Verbose' // See log levels above, this is the default level of the logging system
    disable_default: false, // Indicate if the library should add the 'console' logger or not
    loggers: {          // Custom configuration that can be used by any custom logger implementation
      console: {        // The default log implementation supplied by the library.
        enabled : true  // Indicate if this logger is enabled or not.
        color   : true  // Indicate if the console logger will use colors or not for the different log levels
      }
    },
    instances: {
      // Key : Value pair for specific log configuration
      // For the example above in LogFactory
      MyLogger : 'Error' // All loggers will have the 'Verbose' log level except loggers with the ctx 'MyLogger'
    }
  }
}
```

> **Important**
> 
> The log configuration can be changed at runtime and the changes will be applied.
> ```typescript
> cfgBuilder.addJson({log: { level : 'info' }}).build(); 
> // From now all defaults will be on 'info'. The 'debug' and 'verbose' levels will not be handled anymore.
> cfgBuilder.addJson({log: { loggers : { console : { enabled : false}}}}).build(); 
> // From now the console logger will be disabled.
> cfgBuilder.addJson({log: { instances : { MyLogger : 'Verbose' }}}).build(); 
> // From now, MyLogger logs will handle all levels.
> ```

For the log configuration system to work correctly and config changes to work at runtime for all cases, the best way is not to keep a log around, create it using the [LogFactory](#logfactory) when needed and use it. Of course that does not always work in practice. If you need to keep a log around then you can attach to the 'changed' event either on [ConfigBuilder](#configbuilder) or [RootConfig](#rootconfig), on that event recreate the log using the [LogFactory](#logfactory).