module.exports = {
    name: 'pattern',
    validate: function(params) {
        return params.testConfig
            ? params.testConfig.test(params.fieldValue)
            : true;
    },
    message: function(params) {
        return 'Field "' + params.fieldName + '" does not match required pattern';
    }
};
