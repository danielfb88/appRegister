var helper = {};

helper.isEmpty = function(value) {
    return (value == null) || (typeof(value) == undefined) || (value == '');
}

module.exports = helper;
