import { expect } from "chai";
import { Container } from "inversify";
import { ConfigBuilder, RootConfig } from "../index";

let container: Container = null;
beforeEach(() => {
   container = new Container({ skipBaseClassChecks: true });
   container.bind<RootConfig>(RootConfig).toSelf().inSingletonScope();
   container.bind<ConfigBuilder>(ConfigBuilder).toSelf().inSingletonScope();
   const configBuilder = container.get<ConfigBuilder>(ConfigBuilder);
   configBuilder.addJson({
         test: {
            message: "Hello World"
         }
      }).build();
});

describe('Configuration', () => {

   it('Should provide configuration', () => {
      const rt = container.get<RootConfig>(RootConfig);
      const message = rt.get<any>('test.message');
      expect(message).to.eq('Hello World');
   });

   it('Should change configuration on update', () => {
      const configBuilder = container.get<ConfigBuilder>(ConfigBuilder);
      configBuilder.addJson({
         test: {
            message: "Custom message"
         }
      }).build();
      const rt = container.get<RootConfig>(RootConfig);
      const message = rt.get<any>('test.message');
      expect(message).to.eq('Custom message');
   });

   it('Should scope configuration', () => {
      const rt = container.get<RootConfig>(RootConfig);
      const test = rt.scope('test');
      expect(test).not.to.be.null;
      const message = test.get<string>('message');
      expect(message).to.eq('Hello World');
   });

   it('Should return default if config not available', () => {
      const rt = container.get<RootConfig>(RootConfig);
      const message = rt.get<any>('hello.data', 'Default Value');
      expect(message).to.eq('Default Value');
   });

   it('Should return scoped config as Value', () => {
      const rt = container.get<RootConfig>(RootConfig);
      const scopped = rt.scope('test.message');
      const message = scopped.value<string>();
      expect(message).to.eq('Hello World');
   });

   it('Should return root config as Value', () => {
      const rt = container.get<RootConfig>(RootConfig);
      const scopped = rt.value<any>();
      expect(scopped).to.haveOwnProperty('test');
      const test = scopped.test;
      expect(test).to.haveOwnProperty('message');
      const message = test.message;
      expect(message).to.eq('Hello World');
   });

   it('Should return root config', () => {
      const rt = container.get<RootConfig>(RootConfig);
      const scopped = rt.getData();
      expect(scopped).to.haveOwnProperty('test');
      const test = scopped.test;
      expect(test).to.haveOwnProperty('message');
      const message = test.message;
      expect(message).to.eq('Hello World');
   });

   it('Should have environment', () => {
      process.env.Hello = "Test";
      const cfg = container.get<ConfigBuilder>(ConfigBuilder);
      cfg.addEnvironment()
         .build();
      const rt = container.get<RootConfig>(RootConfig);
      const scopped = rt.scope('env.Hello');
      const message = scopped.value<string>();
      expect(message).to.eq('Test');
   });
})