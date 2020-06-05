module.exports = {
    name: 'readOnly',
    validate: function(params) {
        return !params.testConfig;
    },
    message: function(params) {
        return 'Field "' + params.fieldName + '" is read only';
    },
    skipFurtherTests: function() {
        return true;
    }
};
