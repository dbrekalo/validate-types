module.exports = {
    name: 'required',
    validate: function(params) {
        return params.testConfig
            ? typeof params.fieldValue !== 'undefined'
            : true;
    },
    message: function(params) {
        return 'Field "' + params.fieldName + '" is required';
    },
    skipFurtherTests: function(params) {
        return !params.validateResult;
    },
    testUndefinedValues: true
};
