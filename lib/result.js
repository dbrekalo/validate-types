module.exports = function result(obj, params) {
    return typeof obj === 'function'
        ? obj(params)
        : obj;
}
