module.exports = {
    name: 'min',
    validate: function(params) {
        return typeof params.testConfig === 'number'
            ? params.fieldValue >= params.testConfig
            : true;
    },
    message: function(params) {
        return 'Field "' + params.fieldName + '" minimal value is ' + params.testConfig;
    }
};
