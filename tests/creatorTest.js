var vows = require('vows'),
    assert = require('assert');

var Creator = require('../bin/creator');

vows.describe('The Creator').addBatch({
    'instance': {
        topic: new Creator({ libpath: '../', clientpath: '' }),

        'a method called "create"': function (result) {
            assert.isFunction (result.create);
        },

        'receives the lib path': function (result) {
            assert.isString (result.paths.lib);
        },
        'and the client path': function (result) {
            assert.isString (result.paths.cli);
        },

        'has two paths to copy': function (err, result) {
            assert.isArray (result.toCopy);
            assert.strictEqual (result.toCopy.length, 2);
        }
    }
}).export(module);