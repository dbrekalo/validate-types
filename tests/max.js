module.exports = {
    name: 'max',
    validate: function(params) {
        return typeof params.testConfig === 'number'
            ? params.fieldValue <= params.testConfig
            : true;
    },
    message: function(params) {
        return 'Field "' + params.fieldName + '" maximum value is ' + params.testConfig;
    }
};
