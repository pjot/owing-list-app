angular.module('owings.filters', [])

.filter('currency_display', function () {
    return function (input) {
        return parseFloat(input).toFixed(2);
    };
});
