import { expect } from "chai";
import { Container } from "inversify";
import * as sinon from 'sinon';
import { Host, IModule } from "../src/host";
require('mocha-sinon');

describe('Modules', () => {

   class MyMod implements IModule {
      public init(container: Container, options?: any): void {
      }

   }

   it('Should call init', (done) => {
      const host = new Host();
      const mod = new MyMod();
      host
         .addModule(mod)
         .init({
            log: {
               level: null
            }
         });
      const method = sinon.stub(mod, 'init').resolves();
      host.start().then(() => {
         expect(method.calledOnce).to.be.true;
         expect(method.args[0]).to.not.be.null;
         method.restore();
         done();
      });
   });
});