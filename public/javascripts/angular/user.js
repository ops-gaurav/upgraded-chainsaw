var app = angular.module ('user', ['ui.router', 'ngFileUpload']);

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
    $scope.productCategories = [ 'Electronics' , 'Art', 'Sports' ];

    $scope.rawData = [];

    $scope.fetchProducts = function () {
        $http.get ('/product/all').then (function(d){
            if (d.data.status == 'success'){
                $scope.rawData = d.data.data;
                // represents the display data
                $scope.products = $scope.rawData;
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

    $scope.fetchCategory = function (category) {
        // filter existing data instead of fetching new
        var _productsAlias = [];
        for (var i=0; i<$scope.rawData.length;i++) {
            var  p =$scope.rawData[i];
            if (p.category == category) {
                _productsAlias.push ({
                    _id: p._id,
                    category: p.category,
                    image: p.image,
                    name: p.name,
                    price: p.price
                });
            }
        }
        $scope.products = [];
        $scope.products = _productsAlias;

    }

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
                console.log ('orders: '+ JSON.stringify($scope.orders));
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
app.controller ('UserController', ['$scope', '$rootScope', '$http', '$log', '$window', 'Upload', function ($scope, $rootScope, $http, $log, $window, Upload) {
    $http.get ('/user/sessionInfo'). then (function (d) {
        if (d.data.status == 'success') {
            $rootScope.sessionInfo = d.data.message.doc;
            console.log ($scope.sessionInfo);
        }
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

    $rootScope.setImage = function (file, errFiles, id) {
        alert ('called');
        $scope.file = {};
		$scope.file[id] = file;

		var url ='/user/addImage/'+ id;
		// process saving file
		Upload.upload ({
			url: url,
			method: 'PUT',
			data: {avatar: file}
		}). then (function (d){
			if (d.data.status == 'success') {
				var image = d.data.data.image;

                $rootScope.sessionInfo = d.data.data;

				var nUrl = 'http://localhost:3000/user/image/'+ image.value +'/'+ image.mime;

				console.log (nUrl);	
                // console.log ($('.'+ id));
				$('.'+id).attr ('src', nUrl);
			}
			else
				console.log (d.data.message);
		}, function (d) {
			console.error (JSON.stringify(d));
		});
		$scope.file = file;
	}
}]);
