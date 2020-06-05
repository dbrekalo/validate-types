var isPlainObject = require('../lib/is-plain-object.js');
var typeTest = require('./type.js');

module.exports = {
    name: 'arraySchema',
    validate: function(params) {
        if (!params.testConfig) {
            return true;
        }
        if (isPlainObject(params.testConfig)) {
            return params.fieldValue.every(function(item) {
                var result = params.validator(params.testConfig, item);
                return result.hasErrors === false;
            });
        } else {
            return params.fieldValue.every(function(item) {
                return typeTest.validate({
                    fieldValue: item,
                    testConfig: params.testConfig
                });
            });
        }
    },
    message: function(params) {
        return 'Field "' + params.fieldName + '" is not valid array';
    }
};
