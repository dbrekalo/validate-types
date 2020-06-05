var requiredTest = require('./tests/required.js');
var typeTest = require('./tests/type.js');
var each = require('./lib/each');
var isPlainObject = require('./lib/is-plain-object');
var assign = require('./lib/assign');
var validatorTest = require('./tests/validator.js');

var includedTests = [
    requiredTest,
    typeTest,
    validatorTest
];

function createValidator(testCollection) {

    var testArray = [];
    var testMap = {};

    var validator = function(schema, input, overrrides) {

        var data = {};
        var errors = [];
        var undeclaredFields = {};

        input = input || {};
        overrrides = overrrides || {};

        var validateField = function(fieldName, fieldSchema) {
            var defaultValue = overrrides.assignDefaults === false
                ? undefined
                : (typeof fieldSchema.default === 'function'
                    ? fieldSchema.default()
                    : fieldSchema.default);
            var fieldValue = typeof input[fieldName] !== 'undefined'
                ? input[fieldName]
                : defaultValue;
            var fieldValueIsUndefined = typeof fieldValue === 'undefined';

            if (!fieldValueIsUndefined) {
                data[fieldName] = fieldValue;
            }

            each(testArray, function(test) {
                var testConfig = fieldSchema[test.name];
                if (typeof testConfig === 'undefined') {
                    return;
                }
                if (fieldValueIsUndefined && !test.testUndefinedValues) {
                    return;
                }
                var args = {
                    fieldValue: fieldValue,
                    fieldName: fieldName,
                    fieldSchema: fieldSchema,
                    testConfig: testConfig,
                    input: input,
                    schema: schema,
                    validator: validator
                };
                var validateResult = args.validateResult = test.validate(args);
                if (!validateResult) {
                    var message = overrrides.messages &&
                        overrrides.messages[fieldName] &&
                        overrrides.messages[fieldName][test.name] ||
                        test.message;
                    errors.push({
                        field: fieldName,
                        test: test.name,
                        message: typeof message === 'function'
                            ? message(args)
                            : message
                    });
                }
                if (test.skipFurtherTests && test.skipFurtherTests(args)) {
                    return false;
                }
            });
        };

        Object.keys(schema).forEach(function(fieldName) {
            var fieldSchema = schema[fieldName];
            validateField(fieldName, !isPlainObject(fieldSchema)
                ? {type: fieldSchema}
                : fieldSchema
            );
        });

        Object.keys(input).forEach(function(key) {
            if (!schema[key]) {
                undeclaredFields[key] = input[key];
            }
        });

        return {
            hasErrors: errors.length > 0,
            hasUndeclaredFields: Object.keys(undeclaredFields).length > 0,
            errors: errors,
            data: data,
            undeclaredFields: undeclaredFields
        };
    };

    validator.addTest = function(config, params) {
        var test = assign({}, config);
        var refTestName = params && (params.insertAfter || params.insertBefore);

        if (refTestName) {
            var refPosition = -1;
            each(testArray, function(testConfig, index) {
                if (testConfig.name === refTestName) {
                    refPosition = index;
                    return false;
                }
            });
            if (refPosition >= 0) {
                testArray.splice(params.insertAfter
                    ? refPosition + 1
                    : refPosition,
                0, test);
            } else {
                throw new Error('Test "' + refTestName + '" not found');
            }
        } else {
            testArray.push(test);
        }

        testMap[test.name] = test;
        return validator;
    };

    validator.removeTest = function(name) {
        delete testMap[name];
        testArray = testArray.filter(function(config) {
            return config.name !== name;
        });
        return validator;
    };

    validator.getTest = function(name, byReference) {
        var test = testMap[name];
        return test
            ? (byReference ? test : assign({}, test))
            : undefined;
    };

    validator.setTestMessage = function(name, message) {
        validator.getTest(name, true).message = message;
        return validator;
    };

    validator.validateValue = function(value, fieldConfig) {
        var result = validator({field: fieldConfig}, {field: value});
        return {
            hasErrors: result.hasErrors,
            errors: result.errors.map(function(error) {
                return {test: error.test};
            })
        };
    };

    validator.extractDefaults = function(schema) {
        var data = {};
        Object.keys(schema).forEach(function(key) {
            var fieldSchema = schema[key];
            var defaultValue = isPlainObject(fieldSchema)
                ? fieldSchema.default
                : undefined;
            var defaultValueType = typeof defaultValue;
            if (defaultValueType !== 'undefined') {
                var value = defaultValueType === 'function'
                    ? defaultValue()
                    : defaultValue;
                if (typeof value !== 'undefined') {
                    data[key] = value;
                }
            }
        });
        return data;
    };

    validator.clone = function() {
        return createValidator(testArray);
    };

    validator.createValidator = createValidator;

    (testCollection || includedTests).forEach(function(test) {
        validator.addTest(test);
    });

    return validator;

}

module.exports = createValidator();
