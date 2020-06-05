module.exports = function isPlainObject(obj) {
    return Boolean(obj) === true &&
        typeof obj === 'object' &&
        obj.constructor === Object;
};
