angular.module('owings.controllers', [])

.controller('SettingsCtrl', function ($scope, LocalStore, $ionicModal) {
    $scope.currencies = LocalStore.getCurrencies();
    for (c in $scope.currencies)
    {
        if ($scope.currencies[c].is_default)
            $scope.default_currency = $scope.currencies[c];
    }
    $ionicModal.fromTemplateUrl('templates/edit-currency.html', {
        scope: $scope,
        animation: 'slide-in-up',
    }).then(function (modal) {
        $scope.currencyModal = modal;
    });
    $scope.$on('$destroy', function () {
        $scope.currencyModal.remove();
    });

    $scope.showEditCurrencyModal = function (currency_id) {
        $scope.currency = LocalStore.getCurrency(currency_id);
        $scope.currencyModal.show();
    };

    $scope.saveCurrency = function (currency) {
        LocalStore.saveCurrency(currency);
        $scope.currencyModal.hide();
    };

    $scope.saveActive = function (currency) {
        LocalStore.saveActiveCurrency(currency);
    };
})

.controller('ListsCtrl', function ($scope, LocalStore, $ionicModal) {
    $scope.lists = LocalStore.getLists();
    var currencies = LocalStore.getCurrencies();

    $scope.currency = {
        is_default: true,
        is_active: true,
        rate: 1,
    };
    $ionicModal.fromTemplateUrl('templates/add-default-currency.html', {
        scope: $scope,
        animation: 'slide-in-up',
    }).then(function (modal) {
        $scope.currencyModal = modal;
        if (currencies.length == 0)
            $scope.currencyModal.show();
    });
    $scope.$on('$destroy', function () {
        $scope.currencyModal.remove();
    });

    $scope.saveCurrency = function (currency) {
        LocalStore.saveCurrency(currency);
        $scope.currencyModal.hide();
    };

    $ionicModal.fromTemplateUrl('templates/add-list.html', {
        scope: $scope,
        animation: 'slide-in-up',
    }).then(function (modal) {
        $scope.listModal = modal;
    });
    $scope.$on('$destroy', function () {
        $scope.listModal.remove();
    });

    $scope.showAddListModal = function () {
        $scope.list = {};
        $scope.listModal.show();
    };

    $scope.addList = function (list) {
        LocalStore.saveList(list);
        $scope.listModal.hide();
    };

    $scope.removeList = function (list_id) {
        LocalStore.removeList(list_id);
    };
})

.controller('ListCtrl', function($scope, $stateParams, LocalStore, $ionicModal) {
    $scope.list = LocalStore.getList($stateParams.id);
    $scope.currencies = LocalStore.getActiveCurrencies();

    var inDefaultCurrency = function (amount, currency_id) {
        var currency = LocalStore.getCurrency(currency_id);
        return amount * currency.rate;
    };

    for (c in $scope.currencies)
    {
        if ($scope.currencies[c].is_default)
            $scope.default_currency = $scope.currencies[c];
    }

    $ionicModal.fromTemplateUrl('templates/add-person.html', {
        scope: $scope,
        animation: 'slide-in-up',
    }).then(function (modal) {
        $scope.personModal = modal;
    });
    $scope.$on('$destroy', function () {
        $scope.personModal.remove();
    });

    $ionicModal.fromTemplateUrl('templates/people.html', {
        scope: $scope,
        animation: 'slide-in-up',
    }).then(function (modal) {
        $scope.peopleModal = modal;
    });
    $scope.$on('$destroy', function () {
        $scope.peopleModal.remove();
    });

    $ionicModal.fromTemplateUrl('templates/currencies.html', {
        scope: $scope,
        animation: 'slide-in-up',
    }).then(function (modal) {
        $scope.currenciesModal = modal;
    });
    $scope.$on('$destroy', function () {
        $scope.currenciesModal.remove();
    });

    $ionicModal.fromTemplateUrl('templates/settle.html', {
        scope: $scope,
        animation: 'slide-in-up',
    }).then(function (modal) {
        $scope.settleModal = modal;
    });
    $scope.$on('$destroy', function () {
        $scope.settleModal.remove();
    });

    $ionicModal.fromTemplateUrl('templates/add-payment.html', {
        scope: $scope,
        animation: 'slide-in-up',
    }).then(function (modal) {
        $scope.paymentModal = modal;
    });
    $scope.$on('$destroy', function () {
        $scope.paymentModal.remove();
    });

    $scope.getPayments = function () {
        return $scope.list.payments.filter(function (payment) {
            return payment.amount > 0;
        });
    };

    $scope.getCurrencyName = function (currency_id) {
        for (c in $scope.currencies)
        {
            if ($scope.currencies[c].id == currency_id)
                return $scope.currencies[c].name;
        }
        return '';
    };

    $scope.showAddPersonModal = function () {
        $scope.person = {};
        $scope.personModal.show();
    };

    $scope.selectPerson = function () {
        $scope.peopleModal.show();
    };

    $scope.setPerson = function (person) {
        $scope.payment.person = person.name;
        $scope.peopleModal.hide();
    };

    $scope.selectCurrency = function () {
        $scope.currenciesModal.show();
    };

    $scope.setCurrency = function (currency) {
        $scope.payment.currency_id = currency.id;
        $scope.payment.currency_name = currency.name;
        $scope.currenciesModal.hide();
    };

    $scope.showSettleModal = function () {
        var balances = $scope.getBalances(),
            first, second, needs, can_pay,
            settlements = [];
        for (b in balances)
        {
            first = balances[b];
            if (first.amount > 0)
            {
                needs = first.amount;
                for (c in balances)
                {
                    second = balances[c];
                    if (second.amount < 0)
                    {
                        can_pay = -second.amount;
                        if (needs > can_pay)
                            amount = can_pay;
                        else
                            amount = needs;

                        first.amount -= amount;
                        second.amount += amount;
                        settlements.push({
                            'from': second.person,
                            'to': first.person,
                            'amount': amount,
                        });
                    }
                }
            }
        }
        $scope.settlements = settlements;
        $scope.settleModal.show();
    };

    $scope.settle = function () {
        var settlement, payment, payment_2, people, people_2;
        for (s in $scope.settlements)
        {
            settlement = $scope.settlements[s];
            people = {};
            people_2 = {};
            people[settlement.to] = {'enabled': true};
            people_2[settlement.from] = {'enabled': true};
            payment = {
                'whole_group': false,
                'person': settlement.from,
                'people': people,
                'amount': settlement.amount,
                'currency_id': $scope.default_currency.id,
            };
            payment_2 = {
                'whole_group': false,
                'person': settlement.to,
                'people': people_2,
                'amount': -settlement.amount,
                'currency_id': $scope.default_currency.id,
            };
            $scope.list.payments.push(payment);
            $scope.list.payments.push(payment_2);
        }
        LocalStore.saveList($scope.list);
    };

    $scope.addPerson = function (person) {
        if ( ! $scope.list.people)
            $scope.list.people = [];

        $scope.list.people.push(person);
        LocalStore.saveList($scope.list);
        $scope.personModal.hide();
        $scope.balances = $scope.getBalances();
    };

    $scope.showAddPaymentModal = function () {
        $scope.payment = {
            whole_group: true,
            people: {},
        };
        $scope.paymentModal.show();
    };

    $scope.addPayment = function (payment) {
        if ( ! $scope.list.payments)
            $scope.list.payments = [];

        $scope.list.payments.push(payment);
        LocalStore.saveList($scope.list);
        $scope.paymentModal.hide();
        $scope.balances = $scope.getBalances();
    };

    $scope.getBalances = function () {
        var balances = [],
            payment,
            balance,
            divide,
            in_group,
            amount,
            people = $scope.list.people
                ? $scope.list.people.length
                : 0;

        for (p in $scope.list.people)
        {
            balance = {
                person: $scope.list.people[p].name,
                amount: 0
            };
            balances.push(balance);
        }
        for (p in $scope.list.payments)
        {
            payment = $scope.list.payments[p];
            divide = 0;
            if ( ! payment.whole_group)
            {
                for (p in payment.people)
                {
                    if (payment.people[p].enabled)
                        divide++;
                }
            }
            else
            {
                divide = people;
            }
                
            for (b in balances)
            {
                if (divide != people)
                {
                    in_group = false;
                    for (p in payment.people)
                    {
                        if (p == balances[b].person)
                            in_group = true;
                    }

                    if ( ! in_group)
                        continue;
                }

                amount = inDefaultCurrency(payment.amount, payment.currency_id);
                balances[b].amount -= amount / divide;

                if (balances[b].person == payment.person)
                    balances[b].amount += parseFloat(amount);

            }
        }
        balances.sort(function (a, b) {
            return a.amount < b.amount;
        });
        return balances;
    };
    $scope.balances = $scope.getBalances();
    
    $scope.inDefaultCurrency = inDefaultCurrency;
});

