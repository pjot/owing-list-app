angular.module('owings', ['ionic', 'owings.controllers', 'owings.services', 'owings.filters'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('currencies', {
            url: '/currencies',
            templateUrl: 'templates/currencies.html',
            controller: 'CurrenciesCtrl',
        })
        .state('settings', {
            url: '/settings',
            templateUrl: 'templates/settings.html',
            controller: 'SettingsCtrl',
        })
        .state('lists', {
            cache: false,
            url: '/lists',
            templateUrl: 'templates/lists.html',
            controller: 'ListsCtrl',
        })
        .state('list', {
            url: '/lists/:id',
            templateUrl: 'templates/list.html',
            controller: 'ListCtrl',
        });
    $urlRouterProvider.otherwise('/lists');
})
