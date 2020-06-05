module.exports = {
    name: 'nullable',
    validate: function(params) {
        return true;
    },
    skipFurtherTests: function(params) {
        return params.testConfig === true && params.fieldValue === null;
    }
};
