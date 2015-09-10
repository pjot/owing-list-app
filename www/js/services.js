angular.module('owings.services', [])

.factory('LocalStore', function () {
    var key = 'owie-pjot.se',
        data = false;

    var loadData = function () {
        if (data == false)
        {
            if ( ! window.localStorage.getItem(key))
            {
                data = {
                    lists: [],
                    currencies: [],
                    current_id: 1,
                };
                window.localStorage.setItem(key, JSON.stringify(data));
            }
            data = JSON.parse(window.localStorage.getItem(key));
        }
        return data;
    };

    var clearData = function () {
        window.localStorage.removeItem(key);
    };

    var getId = function () {
        var data = loadData();
        return ++data.current_id;
    };

    var saveData = function (data) {
        window.localStorage.setItem(key, angular.toJson(data));
    }

    return {
        reset: function () {
            clearData();
        },
        getActiveCurrencies: function () {
            var data = loadData().currencies, currencies = [];
            for (c in data)
            {
                if (data[c].is_active)
                    currencies.push(data[c]);
            }
            return currencies;
        },
        getCurrencies: function () {
            return loadData().currencies;
        },
        getCurrency: function (currency_id) {
            var data = loadData(), currency;
            for (i in data.currencies)
            {
                currency = data.currencies[i];
                if (currency.id == currency_id)
                    return currency;
            }
            return {};
        },
        saveActiveCurrency: function (currency) {
            var data = loadData();
            for (c in data.currencies)
            {
                if (data.currencies[c].id == currency.id)
                {
                    data.currencies[c].is_active = currency.is_active;
                    saveData(data);
                    return;
                }
            }
        },
        saveCurrency: function (currency) {
            if ( ! currency.id)
            {
                currency.id = getId();
                data.currencies.push(currency);
            }
            else
            {
                for (i in data.currencies)
                {
                    if (data.currencies[i].id == currency.id)
                    {
                        data.currencies[i] = currency;
                    }
                }
            }
            saveData(data);
        },
        getLists: function () {
            return loadData().lists;
        },
        getList: function(list_id) {
            var data = loadData(), list;
            for (i in data.lists)
            {
                list = data.lists[i];
                if (list.id == list_id)
                    return list;
            }
            return {};
        },
        saveList: function (list) {
            if ( ! list.id)
            {
                list.id = getId();
                data.lists.push(list);
            }
            else
            {
                for (i in data.lists)
                {
                    if (data.lists[i].id == list.id)
                    {
                        data.lists[i] = list;
                    }
                }
            }
            saveData(data);
        },
        removeList: function (list_id) {
            for (i in data.lists)
            {
                if (data.lists[i].id == list_id)
                {
                    data.lists.splice(list_id, 1);
                    return;
                }
            }
        },
    }
});
