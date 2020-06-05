module.exports = {
    name: 'equalsField',
    validate: function(params) {
        return typeof params.testConfig !== 'undefined'
            ? params.fieldValue === params.input[params.testConfig]
            : true;
    },
    message: function(params) {
        return 'Field "' + params.fieldName + '" does not equal field "' + params.testConfig + '"' ;
    }
};
