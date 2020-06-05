var assert = require('chai').assert;
var validateTypes = require('../index.js');
var allTests = require('../tests/all.js');
var minLengthTest = require('../tests/min-length.js');
var nullableTest = require('../tests/nullable.js');
var readOnlyTest = require('../tests/read-only.js');

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

    it('reports undeclared fields as errors', function() {

        var validator = validateTypes.clone().reportUndeclaredAsError(true);

        assert.deepEqual(
            validator({}, {age: 17}).errors,
            [{test: 'undeclared', field: 'age', message: 'Field "age" is not declared'}]
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

        var validate = validateTypes.createValidator()
            .addTest(minLengthTest)
            .addTest(readOnlyTest, {insertAfter: 'required'})
            .addTest(nullableTest, {insertBefore: 'type'});

        var schema = {
            title: {
                type: String,
                required: true,
                nullable: true,
                minLength: 4
            },
            name: {
                type: String,
                readOnly: true
            }
        };

        assert.equal(validate.getTest('minLength').name, 'minLength');
        assert.equal(validate.getTest('nullable').name, 'nullable');
        assert.equal(validate.getTest('readOnly').name, 'readOnly');

        assert.deepEqual(
            validate(schema).errors,
            [{test: 'required', field: 'title', message: 'Field "title" is required'}]
        );

        assert.deepEqual(
            validate(schema, {title: 1234}).errors,
            [{test: 'type', field: 'title', message: 'Field "title" is of invalid type'}]
        );

        assert.isFalse(
            validate(schema, {title: null}).hasErrors
        );

        assert.deepEqual(
            validate(schema, {title: 'Foo'}).errors,
            [{test: 'minLength', field: 'title', message: 'Field "title" minimal length is 4'}]
        );

        assert.deepEqual(
            validate(schema, {title: 'Foobar', name: 123}).errors,
            [{test: 'readOnly', field: 'name', message: 'Field "name" is read only'}]
        );

        assert.isFalse(
            validate(schema, {title: 'Foobar'}).hasErrors
        );

        validate.removeTest('minLength');
        assert.isUndefined(validate.getTest('minLength'));

        assert.throws(function() {
            validate.addTest({name: 'required'}, {insertAfter: 'foo'});
        });

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

describe('Additional tests', function() {

    var validate = validateTypes.createValidator(allTests);

    it('validates read only test', function() {

        var schema = {
            foo: {readOnly: true}
        };

        assert.isFalse(
            validate(schema, {}).hasErrors
        );

        assert.deepEqual(
            validate(schema, {foo: 'bar'}).errors,
            [{test: 'readOnly', field: 'foo', message: 'Field "foo" is read only'}]
        );

    });

    it('validates nullable test', function() {

        var schema = {
            foo: {type: String, nullable: true}
        };

        var schemaNotNullable = {
            foo: {type: String, nullable: false}
        };

        assert.isFalse(
            validate(schema, {foo: 'bar'}).hasErrors
        );

        assert.isFalse(
            validate(schema, {foo: null}).hasErrors
        );

        assert.isTrue(
            validate(schemaNotNullable, {foo: null}).hasErrors
        );

        assert.isTrue(
            validate(schema, {foo: 123}).hasErrors
        );

    });

    it('validates pattern test', function() {

        var schema = {
            foo: {type: String, pattern: /^foo/}
        };

        assert.isFalse(
            validate(schema, {foo: 'foobar'}).hasErrors
        );

        assert.deepEqual(
            validate(schema, {foo: 'bar'}).errors,
            [{test: 'pattern', field: 'foo', message: 'Field "foo" does not match required pattern'}]
        );

    });

    it('validates min and max length test', function() {

        var schema = {
            foo: {type: String, minLength: 2, maxLength: 10}
        };

        assert.isFalse(
            validate(schema, {foo: 'foobar'}).hasErrors
        );

        assert.deepEqual(
            validate(schema, {foo: 'f'}).errors,
            [{test: 'minLength', field: 'foo', message: 'Field "foo" minimal length is 2'}]
        );

        assert.deepEqual(
            validate(schema, {foo: 'foobar-foobar'}).errors,
            [{test: 'maxLength', field: 'foo', message: 'Field "foo" maximum length is 10'}]
        );

    });

    it('validates integer test', function() {

        var schema = {
            foo: {type: Number, integer: true}
        };

        assert.isFalse(
            validate(schema, {foo: 42}).hasErrors
        );

        assert.deepEqual(
            validate(schema, {foo: 42.5}).errors,
            [{test: 'integer', field: 'foo', message: 'Field "foo" is not integer'}]
        );

    });

    it('validates min and max test', function() {

        var schema = {
            foo: {type: Number, min: 0, max: 100}
        };

        assert.isFalse(
            validate(schema, {foo: 42}).hasErrors
        );

        assert.deepEqual(
            validate(schema, {foo: -1}).errors,
            [{test: 'min', field: 'foo', message: 'Field "foo" minimal value is 0'}]
        );

        assert.deepEqual(
            validate(schema, {foo: 101}).errors,
            [{test: 'max', field: 'foo', message: 'Field "foo" maximum value is 100'}]
        );

    });

    it('validates equals test', function() {

        var schema = {
            foo: {type: String, equals: 'bar'}
        };

        assert.isFalse(
            validate(schema, {foo: 'bar'}).hasErrors
        );

        assert.deepEqual(
            validate(schema, {foo: 'test'}).errors,
            [{test: 'equals', field: 'foo', message: 'Field "foo" does not equal expected value'}]
        );

    });

    it('validates equals field test', function() {

        var schema = {
            password: {type: String, equalsField: 'repeatPassword'},
            repeatPassword: String
        };

        assert.isFalse(
            validate(schema, {
                password: '123',
                repeatPassword: '123'
            }).hasErrors
        );

        assert.deepEqual(
            validate(schema, {
                password: '123',
                repeatPassword: '1234'
            }).errors,
            [{test: 'equalsField', field: 'password', message: 'Field "password" does not equal field "repeatPassword"'}]
        );

    });

    it('validates one of test', function() {

        var schema = {
            title: {
                type: String,
                oneOf: ['foo', 'bar']
            }
        };

        assert.isFalse(
            validate(schema, {title: 'foo'}).hasErrors
        );

        assert.deepEqual(
            validate(schema, {title: 'test'}).errors,
            [{test: 'oneOf', field: 'title', message: 'Field "title" does not equal any of predefined values'}]
        );

    });

    it('validates email test', function() {

        var schema = {
            username: {
                type: String,
                email: true
            }
        };

        assert.isFalse(
            validate(schema, {
                username: 'test@mail.com'
            }).hasErrors
        );

        assert.deepEqual(
            validate(schema, {
                username: 'test'
            }).errors,
            [{test: 'email', field: 'username', message: 'Field "username" is not valid email'}]
        );

    });

    it('validates object schema test', function() {

        var schema = {
            config: {
                type: Object,
                objectSchema: {
                    port: Number,
                    url: String
                }
            }
        };

        assert.isFalse(
            validate(schema, {
                config: {port: 3000, url: '/'}
            }).hasErrors
        );

        assert.deepEqual(
            validate(schema, {
                config: {port: false, url: '/'}
            }).errors,
            [{
                test: 'objectSchema',
                field: 'config',
                message: 'Field "config" has invalid fields',
                errors: [{
                    test: 'type',
                    field: 'port',
                    message: 'Field "port" is of invalid type'
                }]
            }]
        );

    });

    it('validates array schema test', function() {

        var stringSchema = {
            userList: {
                type: Array,
                arraySchema: String
            }
        };

        assert.isFalse(
            validate(stringSchema, {
                userList: ['test@mail.com']
            }).hasErrors
        );

        assert.deepEqual(
            validate(stringSchema, {
                userList: ['test@mail.com', 1]
            }).errors,
            [{
                test: 'arraySchema',
                field: 'userList',
                message: 'Field "userList" is not valid array',
                errors: [{
                    test: 'type',
                    field: '[1]'
                }]
            }]
        );

        var objectSchema = {
            userList: {
                type: Array,
                arraySchema: {
                    fullName: String,
                    age: Number
                }
            }
        };

        assert.isFalse(
            validate(objectSchema, {
                userList: [{fullName: 'John Doe', age: 17}]
            }).hasErrors
        );

        assert.deepEqual(
            validate(objectSchema, {
                userList: [{fullName: 'John Doe', age: '17'}]
            }).errors,
            [{
                test: 'arraySchema',
                field: 'userList',
                message: 'Field "userList" is not valid array',
                errors: [{
                    test: 'type',
                    field: '[0].age',
                    message: 'Field "age" is of invalid type'
                }]
            }]
        );

    });

});
