import { expect } from "chai";
import * as sinon from 'sinon';
import { LogFactory } from "../index";
import { Host } from "../src/host";
require('mocha-sinon');

describe('Log levels', () => {
   
   it('Should not log anything if no level', () => {
      const host = new Host();
      host.init({
         log: {
            level: null,
            instances: {
               Config: 'none'
            }
         }
      });
      let container = host.getContainer();
      let logFactory = container.get<LogFactory>(LogFactory);
      let log = logFactory.createLog('Root');
      const logStub = sinon.stub(console, 'log');
      log.error('Anything');
      expect(logStub.calledOnce).to.be.false;
      logStub.restore();
   });   

   it('Should not log anything on level `none`', () => {
      const host = new Host();
      host.init({
         log: {
            level: 'none'
         }
      });
      let container = host.getContainer();
      let logFactory = container.get<LogFactory>(LogFactory);
      let log = logFactory.createLog('Root');
      const logStub = sinon.stub(console, 'log');
      log.error('Anything');
      expect(logStub.calledOnce).to.be.false;
      logStub.restore();
   });

   it('Should log just error', () => {
      const host = new Host();
      host.init({
         log: {
            level: 'error',
            instances: {
               Config: 'none'
            }
         }
      });
      let container = host.getContainer();
      let logFactory = container.get<LogFactory>(LogFactory);
      let log = logFactory.createLog('Root');
      const logStub = sinon.stub(console, 'log');

      log.error('Anything');
      expect(logStub.calledOnce).to.be.true; logStub.resetHistory();

      log.warn('Anything');
      expect(logStub.calledOnce).to.be.false; logStub.resetHistory();      

      log.info('Anything');
      expect(logStub.calledOnce).to.be.false; logStub.resetHistory();      

      log.debug('Anything');
      expect(logStub.calledOnce).to.be.false; logStub.resetHistory();

      log.verbose('Anything');
      expect(logStub.calledOnce).to.be.false; logStub.resetHistory();

      log.verboseJSON('Anything', null);
      expect(logStub.calledOnce).to.be.false; logStub.resetHistory();

      logStub.restore();
   });

   it('Should log just warn and error', () => {
      const host = new Host();
      host.init({
         log: {
            level: 'warn',
            instances: {
               Config : 'none'
            }
         }
      });
      let container = host.getContainer();
      let logFactory = container.get<LogFactory>(LogFactory);
      let log = logFactory.createLog('Root');
      const logStub = sinon.stub(console, 'log');
      log.error('Anything');
      expect(logStub.calledOnce).to.be.true; logStub.resetHistory();

      log.warn('Anything');
      expect(logStub.calledOnce).to.be.true; logStub.resetHistory();

      log.info('Anything');
      expect(logStub.calledOnce).to.be.false; logStub.resetHistory();

      log.debug('Anything');
      expect(logStub.calledOnce).to.be.false; logStub.resetHistory();

      log.verbose('Anything');
      expect(logStub.calledOnce).to.be.false; logStub.resetHistory();

      log.verboseJSON('Anything', null);
      expect(logStub.calledOnce).to.be.false; logStub.resetHistory();

      logStub.restore();
   });

   it('Should log just info, warn and error', () => {
      const host = new Host();
      host.init({
         log: {
            level: 'info',
            instances: {
               Config: 'none'
            }
         }
      });
      let container = host.getContainer();
      let logFactory = container.get<LogFactory>(LogFactory);
      let log = logFactory.createLog('Root');
      const logStub = sinon.stub(console, 'log');
      log.error('Anything');
      expect(logStub.calledOnce).to.be.true; logStub.resetHistory();

      log.warn('Anything');
      expect(logStub.calledOnce).to.be.true; logStub.resetHistory();

      log.info('Anything');
      expect(logStub.calledOnce).to.be.true; logStub.resetHistory();

      log.debug('Anything');
      expect(logStub.calledOnce).to.be.false; logStub.resetHistory();

      log.verbose('Anything');
      expect(logStub.calledOnce).to.be.false; logStub.resetHistory();

      log.verboseJSON('Anything', null);
      expect(logStub.calledOnce).to.be.false; logStub.resetHistory();

      logStub.restore();
   });

   it('Should log just debug, info, warn and error', () => {
      const host = new Host();
      host.init({
         log: {
            level: 'debug',
            instances: {
               Config: 'none'
            }
         }
      });
      let container = host.getContainer();
      let logFactory = container.get<LogFactory>(LogFactory);
      let log = logFactory.createLog('Root');
      const logStub = sinon.stub(console, 'log');
      log.error('Anything');
      expect(logStub.calledOnce).to.be.true; logStub.resetHistory();

      log.warn('Anything');
      expect(logStub.calledOnce).to.be.true; logStub.resetHistory();

      log.info('Anything');
      expect(logStub.calledOnce).to.be.true; logStub.resetHistory();

      log.debug('Anything');
      expect(logStub.calledOnce).to.be.true; logStub.resetHistory();

      log.verbose('Anything');
      expect(logStub.calledOnce).to.be.false; logStub.resetHistory();

      log.verboseJSON('Anything', null);
      expect(logStub.calledOnce).to.be.false; logStub.resetHistory();

      logStub.restore();
   });

   it('Should log everything on verbose', () => {
      const host = new Host();
      host.init({
         log: {
            level: 'verbose',
            instances: {
               Config: 'none'
            }
         }
      });
      let container = host.getContainer();
      let logFactory = container.get<LogFactory>(LogFactory);
      let log = logFactory.createLog('Root');
      const logStub = sinon.stub(console, 'log');
      log.error('Anything');
      expect(logStub.calledOnce).to.be.true; logStub.resetHistory();

      log.warn('Anything');
      expect(logStub.calledOnce).to.be.true; logStub.resetHistory();

      log.info('Anything');
      expect(logStub.calledOnce).to.be.true; logStub.resetHistory();

      log.debug('Anything');
      expect(logStub.calledOnce).to.be.true; logStub.resetHistory();

      log.verbose('Anything');
      expect(logStub.calledOnce).to.be.true; logStub.resetHistory();

      log.verboseJSON('Anything', null);
      expect(logStub.calledOnce).to.be.true; logStub.resetHistory();

      logStub.restore();
   });   

});