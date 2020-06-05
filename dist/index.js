(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = global || self, global.validateTypes = factory());
}(this, (function () { 'use strict';

    var required = {
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
            for (var i = 0, size = Type.length; i < size; i++) {
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

    var type = {
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
    };

    var each = function each(arrayObj, callback) {
        for (var i = 0, size = arrayObj.length; i < size; i++) {
            if (callback(arrayObj[i], i) === false) {
                break;
            }
        }
    };

    var isPlainObject = function isPlainObject(obj) {
        return Boolean(obj) === true &&
            typeof obj === 'object' &&
            obj.constructor === Object;
    };

    var assign = function assign(target, source) {
        Object.keys(source).forEach(function(key) {
            target[key] = source[key];
        });
        return target;
    };

    var result = function result(obj, params) {
        return typeof obj === 'function'
            ? obj(params)
            : obj;
    };

    var validator = {
        name: 'validator',
        validate: function(params) {
            return Boolean(params.testConfig(params.fieldValue));
        },
        message: function(params) {
            return 'Field "' + params.fieldName + '" failed validation';
        }
    };

    var includedTests = [
        required,
        type,
        validator
    ];

    function createValidator(testCollection, validatorParams) {

        testCollection = testCollection || includedTests;
        validatorParams = validatorParams || {};

        var testArray = [];
        var testMap = {};

        var undeclaredIsError = Boolean(
            validatorParams.reportUndeclaredAsError
        );
        var undeclaredErrorMessage = function(params) {
            return 'Field "' + params.fieldName + '" is not declared';
        };

        var validator = function(schema, input, overrrides) {

            var data = {};
            var errors = [];
            var undeclaredFields = {};

            input = input || {};
            overrrides = overrrides || {};

            var validateField = function(fieldName, fieldSchema) {
                var defaultValue = overrrides.assignDefaults === false
                    ? undefined
                    : result(fieldSchema.default);
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
                    var childErrors = null;
                    var args = {
                        fieldValue: fieldValue,
                        fieldName: fieldName,
                        fieldSchema: fieldSchema,
                        testConfig: testConfig,
                        input: input,
                        schema: schema,
                        validator: validator,
                        addChildError: function(error) {
                            childErrors = childErrors || [];
                            childErrors.push(error);
                        }
                    };
                    var validateResult = args.validateResult = test.validate(args);
                    if (!validateResult) {
                        var message = overrrides.messages &&
                            overrrides.messages[fieldName] &&
                            overrrides.messages[fieldName][test.name] ||
                            test.message;
                        var fieldError = {
                            field: fieldName,
                            test: test.name,
                            message: result(message, args)
                        };
                        if (childErrors) {
                            fieldError.errors = childErrors;
                        }
                        errors.push(fieldError);
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
                    undeclaredIsError && errors.push({
                        field: key,
                        test: 'undeclared',
                        message: result(undeclaredErrorMessage, {
                            fieldName: key,
                            fieldValue: input[key],
                            input: input,
                            schema: schema,
                            validator: validator
                        })
                    });
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

            if (testMap[config.name]) {
                validator.removeTest(config.name);
            }

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

        validator.setTestMessage = function(testName, message) {
            if (testName === 'undeclared') {
                undeclaredErrorMessage = message;
            } else {
                validator.getTest(testName, true).message = message;
            }
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
                    var value = result(defaultValue);
                    if (typeof value !== 'undefined') {
                        data[key] = value;
                    }
                }
            });
            return data;
        };

        validator.clone = function() {
            return createValidator(testArray, {
                reportUndeclaredAsError: undeclaredIsError,
                messages: {undeclared: undeclaredErrorMessage}
            });
        };

        validator.reportUndeclaredAsError = function(isError) {
            undeclaredIsError = isError;
            return validator;
        };

        validator.createValidator = createValidator;

        testCollection.forEach(function(test) {
            validator.addTest(test);
        });

        Object.keys(validatorParams.messages || {}).forEach(function(testName) {
            validator.setTestMessage(testName, validatorParams.messages[testName]);
        });

        return validator;

    }

    var validateTypes = createValidator();

    return validateTypes;

})));
