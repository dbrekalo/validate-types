module.exports = {
    name: 'objectSchema',
    validate: function(params) {
        if (params.testConfig) {
            var result = params.validator(params.testConfig, params.fieldValue);
            return result.hasErrors === false;
        } else {
            return true;
        }
    },
    message: function(params) {
        return 'Field "' + params.fieldName + '" has invalid fields';
    }
};
