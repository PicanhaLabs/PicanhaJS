var vows = require('vows'),
    fs = require('fs'),
    assert = require('assert');

var utils = require('../bin/utils');

vows.describe('Utils functions').addBatch({
    'recursiveCopy': {
        topic: function() {
            var me = this;
        
            fs.mkdir('./testDir');
            
            utils.recursiveCopy('./testDir', './testDirCopy').then(function(d){
                fs.exists(d, function(result){
                   me.callback(null, result); 
                });
            });
        },

        'must copy a folder to another place': function (result) {
            assert.isTrue (result);
            
            fs.rmdir('./testDir');
            fs.rmdir('./testDirCopy');
        }
    }
}).export(module);