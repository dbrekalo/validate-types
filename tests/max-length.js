module.exports = {
    name: 'maxLength',
    validate: function(params) {
        return typeof params.testConfig === 'number'
            ? params.fieldValue.length <= params.testConfig
            : true;
    },
    message: function(params) {
        return 'Field "' + params.fieldName + '" maximum length is ' + params.testConfig;
    }
};
