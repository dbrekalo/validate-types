module.exports = {
    name: 'minLength',
    validate: function(params) {
        return typeof params.testConfig === 'number'
            ? params.fieldValue.length >= params.testConfig
            : true;
    },
    message: function(params) {
        return 'Field "' + params.fieldName + '" minimal length is ' + params.testConfig;
    }
};
