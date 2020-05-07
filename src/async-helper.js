'use strict';

const Promise = require('bluebird').Promise;

/**
 * Exposes utility methods to help execution of async tests.
 * @module asyncHelper
 */
module.exports = {
    /**
     * Returns a promise that will be resolved after a specific delay. Useful
     * when relying on timing to ensure that tests are evaluated correctly, or
     * to yield to the javascript runtime.
     *
     * @param {Number} delay The delay (in milliseconds) after which the
     *        promise will be resolved.
     *
     * @return {Promise} A promise that will be resolved once the delay
     *         expires.
     */
    wait: function (delay) {
        if (typeof delay !== 'number' || delay <= 0) {
            throw new Error('Invalid delay specified (arg #1)');
        }
        return (data) => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve(data);
                }, delay);
            });
        };
    },
};
