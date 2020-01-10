import { expect } from "chai";
import { Container } from "inversify";
import * as sinon from 'sinon';
import { ILog, LogFactory } from "../index";
import { Host } from "../src/host";
require('mocha-sinon');

describe('Log', () => {
   let container: Container = null;
   let log: ILog = null;
   let logStub: sinon.SinonStub = null;
   before(() => {
      const host = new Host();
      host.init({
         log: {
            level: 'verbose',
            instances: {
               Config : 'none'
            }
         }
      });
      container = host.getContainer();
      let logFactory = container.get<LogFactory>(LogFactory);
      log = logFactory.createLog('Root');
      logStub = sinon.stub(console, 'log');
   });
   
   it('Should log info', () => {
      logStub.resetHistory();
      log.info('Hello');
      expect(logStub.calledOnce).to.be.true;
   });

   it('Should log info with payload', () => {
      logStub.resetHistory();
      log.info('Hello', {});
      expect(logStub.calledOnce).to.be.true;
   });

   it('Should log error', () => {
      logStub.resetHistory();
      log.error('Hello');
      expect(logStub.calledOnce).to.be.true;
   });

   it('Should log error with payload', () => {
      logStub.resetHistory();
      log.error('Hello', {});
      expect(logStub.calledOnce).to.be.true;
   });

   it('Should log warning', () => {
      logStub.resetHistory();
      log.warn('Hello');
      expect(logStub.calledOnce).to.be.true;
   });

   it('Should log warning with payload', () => {
      logStub.resetHistory();
      log.warn('Hello', {});
      expect(logStub.calledOnce).to.be.true;
   });

   it('Should log debug', () => {
      logStub.resetHistory();
      log.debug('Hello');
      expect(logStub.calledOnce).to.be.true;
   });

   it('Should log debug with payload', () => {
      logStub.resetHistory();
      log.debug('Hello', {});
      expect(logStub.calledOnce).to.be.true;
   });

   it('Should log verbose', () => {
      logStub.resetHistory();
      log.verbose('Hello');
      expect(logStub.calledOnce).to.be.true;
   });

   it('Should log verbose with payload', () => {
      logStub.resetHistory();
      log.verbose('Hello', {});
      expect(logStub.calledOnce).to.be.true;
   });

   it('Should log verbose json with payload', () => {
      logStub.resetHistory();
      log.verboseJSON('Hello', {});
      expect(logStub.calledOnce).to.be.true;
   });

   after(() => {
      logStub.restore();
   })
});