module.exports = function each(arrayObj, callback) {
    for (var i = 0, size = arrayObj.length; i < size; i++) {
        if (callback(arrayObj[i], i) === false) {
            break;
        }
    }
};
