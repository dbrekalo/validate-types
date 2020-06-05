module.exports = {
    name: 'oneOf',
    validate: function(params) {
        return Array.isArray(params.testConfig)
            ? typeof params.testConfig.find(function(item) {
                return item === params.fieldValue;
            }) !== 'undefined'
            : true;
    },
    message: function(params) {
        return 'Field "' + params.fieldName + '" does not equal any of predefined values';
    }
};
