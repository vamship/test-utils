'use strict';

const _sinon = require('sinon');
const _chai = require('chai');
_chai.use(require('sinon-chai'));
_chai.use(require('chai-as-promised'));
const expect = _chai.expect;
const _rewire = require('rewire');

let _consoleHelper = null;

describe('consoleHelper', function() {
    const _methodNames = ['log', 'info', 'warn', 'error'];
    const _consoleMethods = [];
    let consoleSpy = null;

    function _startSpying() {
        // eslint-disable-next-line no-console
        consoleSpy = _sinon.spy();
        _methodNames.forEach((method) => {
            // eslint-disable-next-line no-console
            _consoleMethods[method] = console[method];

            // eslint-disable-next-line no-console
            console[method] = consoleSpy;
        });
    }

    function _stopSpying() {
        _methodNames.forEach((method) => {
            // eslint-disable-next-line no-console
            console[method] = _consoleMethods[method];
        });
    }

    function _invokeConsole(message) {
        message = message || 'Test';
        _methodNames.forEach((method) => {
            // eslint-disable-next-line no-console
            console[method](message);
        });
    }

    beforeEach(() => {
        _consoleHelper = _rewire('../../src/console-helper');
    });

    it('should expose methods required by the interface', function() {
        expect(_consoleHelper.mute).to.be.a('function');
        expect(_consoleHelper.unmute).to.be.a('function');
    });

    describe('mute()', () => {
        it('should replace all console methods with a different function', () => {
            _startSpying();
            expect(consoleSpy).to.not.have.been.called;

            _consoleHelper.mute();
            _invokeConsole();
            _stopSpying();

            expect(consoleSpy).to.not.have.been.called;
        });

        it('should do nothing if the console is already muted', () => {
            _startSpying();
            _consoleHelper.mute();
            _stopSpying();

            // Replace all console methods with a fresh set of spies and try
            // muting them again. But this time, the methods should not be
            // muted by the helper because it thinks that it has already muted
            // the console. So the spy should get called multiple times.
            _startSpying();
            expect(consoleSpy).to.not.have.been.called;

            _consoleHelper.mute();
            _invokeConsole();
            _stopSpying();

            expect(consoleSpy.callCount).to.equal(_methodNames.length);
        });
    });

    describe('unmute()', () => {
        it('should do nothing if the console is not muted', () => {
            _startSpying();
            expect(consoleSpy).to.not.have.been.called;

            _consoleHelper.unmute();
            _invokeConsole();
            _stopSpying();

            expect(consoleSpy.callCount).to.equal(_methodNames.length);
        });

        it('should restore all console methods with original references', () => {
            _startSpying();
            _consoleHelper.mute();
            _invokeConsole();

            // Now unmute the console, and see if the spy gets called multiple
            // times.
            _consoleHelper.unmute();
            _invokeConsole();
            _stopSpying();

            expect(consoleSpy.callCount).to.equal(_methodNames.length);
        });
    });
});
