var app = angular.module ('user', ['ui.router']);

app.config (['$stateProvider', '$urlRouterProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $locationProvider) {

    $stateProvider
        .state('user', {
            url: '/user',
            views: {
                '': {
                    templateUrl: '/javascripts/angular/templates/user/user-template.html',
                    controller: 'UserController'
                },

                'productsListing@user': {
                    templateUrl: '/javascripts/angular/templates/user/products-list-template.html',
                    controller: 'ProductsListController'
                },

                'ordersListing@user': {
                    templateUrl: '/javascripts/angular/templates/user/orders-list-template.html',
                    controller: 'OrdersListController'
                }
            }
        });

    $urlRouterProvider.otherwise ('/user');
    $locationProvider.html5Mode ({
        enabled: true,
        requireBase: false
    });
}]);

app.controller ('ProductsListController', ['$scope', '$rootScope', '$http', '$log', function ($scope, $rootScope, $http, $log) {
    $scope.pageTitle = 'We have following products for you to shop today';

    $scope.fetchProducts = function () {
        $http.get ('/product/all').then (function(d){
            if (d.data.status == 'success'){
                $scope.products = d.data.data;
                $log.log ($scope.products);
            }
            else
                $log.log ('response error: '+ d.data.message);

            $rootScope.fetchOrders();
        }, function(d){
            if (d.status == 500)
                $log.error ('server error');
            else 
                $log.log (JSON.stringify (d));

            $rootScope.fetchOrders();
        });
    };

    $scope.fetchProducts();

    $scope.buyItem = function (pId) {
        $http.post ('/order/add/'+ pId). then (function (d) {
            if (d.data.status == 'success')
                $rootScope.fetchOrders();
            else
                console.log (d.data.message);
        }, function (d){ 
            if (d.status == 500)
                console.error ('server error');
            else
                console.error (JSON.stringify(d));
        });
    }
}]);

app.controller ('OrdersListController', ['$scope', '$rootScope', '$http', function ($scope, $rootScope, $http) {
    $scope.pageTitle = 'Your recent orders';

    $rootScope.fetchOrders = function () {
        $http.get ('/order/myorders').then (function (data){
            if (data.data.status == 'success' ) {
                $scope.orders = data.data.data;
                console.log ('orders: '+ $scope.orders);
            }
            else
                console.log (data.data.message);
        }, function (data){
            console.log (JSON.stringify(data));
        });
    }
}]);

/**
 * the default controller
 */
app.controller ('UserController', ['$scope', '$rootScope', '$http', '$log', '$window', function ($scope, $rootScope, $http, $log, $window) {
    $http.get ('/user/sessionInfo'). then (function (d) {
        if (d.data.status == 'success')
            $scope.sessionInfo = d.data.message.doc;
        else
            $window.location = '/';
    }, function (d) {
        $log.log ('ERROR: '+ d);
    });

    $rootScope.logout = function () {
        $http.get ('/user/logout').then (function () {
            $window.location = '/';
        });
    }
}]);