var emailPattern = /\S+@\S+\.\S+/;

module.exports = {
    name: 'email',
    validate: function(params) {
        return params.testConfig
            ? emailPattern.test(params.fieldValue)
            : true;
    },
    message: function(params) {
        return 'Field "' + params.fieldName + '" is not valid email';
    },
    setPattern: function(pattern) {
        emailPattern = pattern;
    }
};
