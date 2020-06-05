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

module.exports = {
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
