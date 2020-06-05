module.exports = {
    name: 'integer',
    validate: function(params) {
        var value = params.fieldValue;
        return params.testConfig
            ? isFinite(value) && Math.floor(value) === value
            : true;
    },
    message: function(params) {
        return 'Field "' + params.fieldName + '" is not integer';
    }
};
