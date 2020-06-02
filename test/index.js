var assert = require('chai').assert;
var validateTypes = require('../index.js');

describe('Validate types', function() {

    it('type checks required types', function() {

        var schema = {title: {required: true}};

        assert.isTrue(
            validateTypes(schema).hasErrors
        );

        assert.deepEqual(
            validateTypes(schema).errors,
            [{test: 'required', field: 'title', message: 'Field "title" is required'}]
        );

        assert.isTrue(
            validateTypes(schema, {title: undefined}).hasErrors
        );

        assert.isFalse(
            validateTypes(schema, {title: null}).hasErrors
        );

        assert.isFalse(
            validateTypes(schema, {title: 'foo'}).hasErrors
        );

    });

    it('type checks string props', function() {

        assert.isFalse(
            validateTypes({title: String}, {title: 'Foo'}).hasErrors
        );

        assert.isTrue(
            validateTypes({title: String}, {title: 42}).hasErrors
        );

        assert.deepEqual(
            validateTypes({title: String}, {title: 42}).errors,
            [{test: 'type', field: 'title', message: 'Field "title" is of invalid type'}]
        );

        assert.isFalse(
            validateTypes({title: String}).hasErrors
        );

    });

    it('type checks boolean props', function() {

        var schema = {published: Boolean};

        assert.isTrue(
            validateTypes(schema, {published: 'true'}).hasErrors
        );

        assert.isFalse(
            validateTypes(schema, {published: true}).hasErrors
        );

    });

    it('type checks number props', function() {

        var schema = {age: Number};

        assert.isTrue(
            validateTypes(schema, {age: '18'}).hasErrors
        );

        assert.isFalse(
            validateTypes(schema, {age: 18}).hasErrors
        );

    });

    it('type checks function props', function() {

        var schema = {callback: Function};

        assert.isTrue(
            validateTypes(schema, {callback: 'test'}).hasErrors
        );

        assert.isFalse(
            validateTypes(schema, {callback: function() {}}).hasErrors
        );

    });

    it('type checks object props', function() {

        var schema = {data: Object};

        assert.isTrue(
            validateTypes(schema, {data: 'test'}).hasErrors
        );

        assert.isFalse(
            validateTypes(schema, {data: {}}).hasErrors
        );

    });

    it('type checks array props', function() {

        var schema = {data: Array};

        assert.isTrue(
            validateTypes(schema, {data: 'test'}).hasErrors
        );

        assert.isFalse(
            validateTypes(schema, {data: [1, 2]}).hasErrors
        );

    });

    it('type checks complex props', function() {

        var schema = {date: Date};

        assert.isTrue(
            validateTypes(schema, {date: '12.02.1985'}).hasErrors
        );

        assert.isFalse(
            validateTypes(schema, {date: new Date()}).hasErrors
        );

    });

    it('type checks multiple alowed types', function() {

        var schema = {age: [String, Number]};

        assert.isTrue(
            validateTypes(schema, {age: false}).hasErrors
        );

        assert.isFalse(
            validateTypes(schema, {age: 18}).hasErrors
        );

        assert.isFalse(
            validateTypes(schema, {age: '18'}).hasErrors
        );

    });

    it('returns data with joined default and user values', function() {

        var schema = {
            title: {default: 'Test'},
            published: {default: true},
            tags: {default: function() { return []; }}
        };

        assert.deepEqual(
            validateTypes(schema).data,
            {title: 'Test', published: true, tags: []}
        );

        assert.deepEqual(
            validateTypes(schema, {title: 'My test'}).data,
            {title: 'My test', published: true, tags: []}
        );

        assert.deepEqual(
            validateTypes(schema, {published: undefined, tags: ['foo']}).data,
            {title: 'Test', published: true, tags: ['foo']}
        );

    });

    it('extracts schema defaults', function() {

        var schema = {
            title: {default: 'Test'},
            published: {default: true},
            tags: {default: function() { return []; }},
            age: Number
        };

        assert.deepEqual(
            validateTypes.extractDefaults(schema),
            {title: 'Test', published: true, tags: []}
        );

    });

    it('defaults merging can be disabled', function() {

        var schema = {
            title: {type: String, default: 'Test'},
            published: {default: true},
            age: {default: 18}
        };

        assert.deepEqual(
            validateTypes(schema, {published: false}, {assignDefaults: false}).data,
            {published: false}
        );

    });

    it('returns undeclared fields', function() {

        var schema = {
            title: {type: String, default: 'Test'},
        };

        var input = {age: 14, text: 'foo'};

        assert.isTrue(
            validateTypes(schema, input).hasUndeclaredFields
        );

        assert.deepEqual(
            validateTypes(schema, input).undeclaredFields,
            input
        );

    });

    it('type checks props with custom validator', function() {

        var schema = {
            title: {
                type: String,
                required: true,
                validator: function(value) { return value.length > 2; }
            }
        };

        assert.isTrue(
            validateTypes(schema, {title: 'F'}).hasErrors
        );

        assert.deepEqual(
            validateTypes(schema, {title: 'F'}).errors,
            [{test: 'validator', field: 'title', message: 'Field "title" failed validation'}]
        );

        assert.isFalse(
            validateTypes(schema, {title: 'Foo'}).hasErrors
        );

        assert.isTrue(
            validateTypes(schema, {title: 1234}).hasErrors
        );

    });

    it('new validator with custom tests can be created', function() {

        var validate = validateTypes.createValidator();

        validate.addTest({
            name: 'minLength',
            validate: function(params) {
                return params.fieldValue.length >= params.testConfig;
            },
            message: function(params) {
                return 'Field "' + params.fieldName + '" must have ' + params.testConfig + ' charters minimum';
            }
        });

        var schema = {
            title: {
                type: String,
                required: true,
                minLength: 4
            }
        };

        assert.equal(validate.getTest('minLength').name, 'minLength');

        assert.deepEqual(
            validate(schema).errors,
            [{test: 'required', field: 'title', message: 'Field "title" is required'}]
        );

        assert.deepEqual(
            validate(schema, {title: 1234}).errors,
            [{test: 'type', field: 'title', message: 'Field "title" is of invalid type'}]
        );

        assert.deepEqual(
            validate(schema, {title: 'Foo'}).errors,
            [{test: 'minLength', field: 'title', message: 'Field "title" must have 4 charters minimum'}]
        );

        assert.isFalse(
            validate(schema, {title: 'Foobar'}).hasErrors
        );

        validate.removeTest('minLength');
        assert.isUndefined(validate.getTest('minLength'));

    });

    it('test message can be customized', function() {

        var validate = validateTypes.createValidator();
        var schema = {title: String};

        validate.setTestMessage('type', 'foo');

        assert.equal(
            validate(schema, {title: 123}).errors[0].message,
            'foo'
        );

        validate.setTestMessage('type', function(params) {
            return [params.fieldName, params.fieldValue].join(' ');
        });

        assert.equal(
            validate(schema, {title: 123}).errors[0].message,
            'title 123'
        );

        assert.deepEqual(
            validate(schema, {title: 123}, {
                messages: {
                    title: {
                        type: 'bar'
                    }
                }
            }).errors[0].message,
            'bar'
        );

    });

    it('validates single value', function() {

        assert.deepEqual(
            validateTypes.validateValue(123, {type: String}),
            {hasErrors: true, errors: [{test: 'type'}]}
        );

        assert.isFalse(
            validateTypes.validateValue('Test', {type: String}).hasErrors
        );

    });

});
