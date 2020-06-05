module.exports = {
    name: 'validator',
    validate: function(params) {
        return Boolean(params.testConfig(params.fieldValue));
    },
    message: function(params) {
        return 'Field "' + params.fieldName + '" failed validation';
    }
};
