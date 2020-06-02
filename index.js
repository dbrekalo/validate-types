function getIncludedTests() {
    return [
        {
            name: 'required',
            validate: function(params) {
                var isRequired = Boolean(params.testConfig);
                var fieldValue = params.fieldValue;
                return isRequired && typeof fieldValue !== 'undefined';
            },
            message: function(params) {
                return 'Field "' + params.fieldName + '" is required';
            },
            skipFurtherTests: function(params) {
                return !params.validateResult;
            },
            testUndefinedValues: true,
        },
        {
            name: 'type',
            validate: function(params) {
                return isValidType(params.fieldValue, params.testConfig);
            },
            message: function(params) {
                return 'Field "' + params.fieldName + '" is of invalid type';
            },
            skipFurtherTests: function(params) {
                return !params.validateResult;
            }
        },
        {
            name: 'validator',
            validate: function(params) {
                return Boolean(params.testConfig(params.fieldValue));
            },
            message: function(params) {
                return 'Field "' + params.fieldName + '" failed validation';
            }
        }
    ];
}

function isValidSingleType(value, Type) {

    var isValid = false;
    var valueType = typeof value;

    var checkType = function(type) {
        isValid = valueType === type;
    };

    switch (Type) {
        case String: checkType('string'); break;
        case Number: checkType('number'); break;
        case Boolean: checkType('boolean'); break;
        case Function: checkType('function'); break;
        case Array:
            isValid = Array.isArray(value);
            break;
        case Object:
            isValid = valueType === 'object' && value !== null && !Array.isArray(value);
            break;
        default:
            isValid = value instanceof Type;
    }
    return isValid;

}

function isValidType(value, Type) {

    if (Array.isArray(Type)) {
        var isValid = false;
        for (var i = 0; i < Type.length; i++) {
            if (isValidSingleType(value, Type[i])) {
                isValid = true;
                break;
            }
        }
        return isValid;
    } else {
        return isValidSingleType(value, Type);
    }

}

function isPlainObject(obj) {
    return Boolean(obj) === true &&
        typeof obj === 'object' &&
        obj.constructor === Object;
}

function assign(target, source) {
    Object.keys(source).forEach(function(key) {
        target[key] = source[key];
    });
    return target;
}

function each(arrayObj, callback) {
    for (var i = 0; i < arrayObj.length; i++) {
        if (callback(arrayObj[i]) === false) {
            break;
        }
    }
}

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
                    schema: schema
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

    validator.addTest = function(config) {
        testMap[config.name] = config;
        testArray.push(config);
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

    validator.createValidator = createValidator;

    (testCollection || getIncludedTests()).forEach(function(test) {
        validator.addTest(test);
    });

    return validator;

}

module.exports = createValidator();
