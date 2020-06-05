module.exports = {
    name: 'equals',
    validate: function(params) {
        return typeof params.testConfig !== 'undefined'
            ? params.fieldValue === params.testConfig
            : true;
    },
    message: function(params) {
        return 'Field "' + params.fieldName + '" does not equal expected value';
    }
};
