(function(root, factory) {
    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.validateTypes = factory();
    }

}(this, function() {

    var simpleTypes = [String, Number, Boolean, Function, Object, Array];
    var simpleTypeNames = ['string', 'number', 'boolean', 'function', 'object', 'array'];

    function isValidSingleType(value, Type) {

        var isValid = true;
        var simpleTypeIndex = simpleTypes.indexOf(Type);
        var isComplexType = simpleTypeIndex < 0;
        var typeName = isComplexType ? undefined : simpleTypeNames[simpleTypeIndex];

        if (isComplexType) {

            if (!(value instanceof Type)) {
                isValid = false;
            }

        } else {

            if (typeName === 'array') {
                if (!Array.isArray(value)) {
                    isValid = false;
                }
            } else if (typeof value !== typeName) {
                isValid = false;
            }
        }

        return isValid;

    }

    function isValidType(value, Type) {

        var isValid;

        if (Array.isArray(Type)) {

            isValid = false;

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

        return Object.prototype.toString.call(obj) === '[object Object]';

    }

    return function(schema, params, context) {

        var data = {};
        var errors = [];

        var iterator = function(key, rules) {

            var defaultValue = rules.default;
            var paramValue = params && params[key];
            var value;
            var valueType;

            if (isPlainObject(defaultValue) || Array.isArray(defaultValue)) {
                errors.push({
                    key: key,
                    message: 'Object or array prop not allowed for "' + key + '". Use factory function.'
                });
            }

            if (typeof defaultValue === 'function') {
                defaultValue = defaultValue.call(context);
            }

            value = typeof paramValue !== 'undefined' ? paramValue : defaultValue;
            valueType = typeof value;
            data[key] = value;

            if (rules.required && valueType === 'undefined') {
                errors.push({
                    key: key,
                    message: 'Prop "' + key + '" is required'
                });
            }

            if (valueType !== 'undefined') {

                var type = isPlainObject(rules) ? rules.type : rules;

                if (type && !isValidType(value, type)) {
                    errors.push({
                        key: key,
                        message: 'Prop "' + key + '" is of invalid type'
                    });
                }

                if (rules.validator && !rules.validator.call(context, value)) {
                    errors.push({
                        key: key,
                        message: 'Prop "' + key + '" failed to pass validator check'
                    });
                }

            }

        };

        for (var key in schema) {
            schema.hasOwnProperty(key) && iterator(key, schema[key]);
        }

        return {
            hasErrors: errors.length > 0,
            errors: errors,
            data: data
        };

    };

}));
