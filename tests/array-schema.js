var isPlainObject = require('../lib/is-plain-object');
var typeTest = require('./type');

module.exports = {
    name: 'arraySchema',
    validate: function(params) {
        if (!params.testConfig) {
            return true;
        }
        if (isPlainObject(params.testConfig)) {
            return params.fieldValue.every(function(item, index) {
                var result = params.validator(params.testConfig, item);
                result.errors.forEach(function(error) {
                    error.field = '[' + index + '].' + error.field;
                    params.addChildError(error);
                });
                return result.hasErrors === false;
            });
        } else {
            return params.fieldValue.every(function(item, index) {
                var result = typeTest.validate({
                    fieldValue: item,
                    testConfig: params.testConfig
                });
                !result && params.addChildError({
                    field: '[' + index + ']',
                    test: 'type'
                });
                return result;
            });
        }
    },
    message: function(params) {
        return 'Field "' + params.fieldName + '" is not valid array';
    }
};
