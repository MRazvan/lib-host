import { expect } from "chai";
import * as sinon from 'sinon';
import { Host } from "../src/host";
import { Runnable } from "../src/runnable/runnable";
require('mocha-sinon');

describe('Should call runnable methods', () => {

   it('Should call start', (done) => {
      const host = new Host();
      host.init({
         log: {
            level: null
         }
      });
      const runnable = new Runnable();
      const start = sinon.stub(runnable, 'start').resolves();
      
      host.getContainer().bind(Runnable).toConstantValue(runnable);
      host.start().then(() => {
         expect(start.calledOnce).to.be.true;
         start.restore();
         done();
      });
   });

   it('Should call allStarted', (done) => {
      const host = new Host();
      host.init({
         log: {
            level: null
         }
      });
      const runnable = new Runnable();
      const methodStub = sinon.stub(runnable, 'allStarted').resolves();

      host.getContainer().bind(Runnable).toConstantValue(runnable);
      host.start().then(() => {
         expect(methodStub.calledOnce).to.be.true;
         methodStub.restore();
         done();
      });
   });

   it('Should call stop', (done) => {
      const host = new Host();
      host.init({
         log: {
            level: null
         }
      });
      const runnable = new Runnable();
      const methodStub = sinon.stub(runnable, 'stop').resolves();

      host.getContainer().bind(Runnable).toConstantValue(runnable);
      host.start().then(() =>
         host.stop().then(() => {
            expect(methodStub.calledOnce).to.be.true;
            methodStub.restore();
            done();
         })
      )
   });

   it('Should call allStopped', (done) => {
      const host = new Host();
      host.init({
         log: {
            level: null
         }
      });
      const runnable = new Runnable();
      const methodStub = sinon.stub(runnable, 'allStopped').resolves();

      host.getContainer().bind(Runnable).toConstantValue(runnable);
      host.start().then(() =>
         host.stop().then(() => {
            expect(methodStub.calledOnce).to.be.true;
            methodStub.restore();
            done();
         })
      )
   });
});