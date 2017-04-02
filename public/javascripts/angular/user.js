var app = angular.module ('user', ['ui.router', 'ngFileUpload', 'ngMask']);

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
        })
        .state ('orders', {
            url: '/user/orders',
            templateUrl: '/user/orders-list-template.html',
            controller: 'OrdersListController'
        })
        .state ('edit', {
            url: '/user/edit',
            templateUrl: '/user/edit-user-template.html',
            controller: 'EditUserController'
        });

    $urlRouterProvider.otherwise ('/user');
    $locationProvider.html5Mode ({
        enabled: true,
        requireBase: false
    });
}]);

app.controller ('ProductsListController', ['$scope', '$rootScope', '$http', '$log', function ($scope, $rootScope, $http, $log) {
    $scope.pageTitle = 'We have following products for you to shop today';
    $scope.productCategories = [];
    $scope.selectedFilter = 'All';

    $http.get ('/category/all').then (function (d) {
        if (d.data.status == 'success') {
            var response = d.data.message;
            response.forEach (item => $scope.productCategories.push (item.name));
        } else {
            $log.info (d.data.message);
        }
    }, function (d) {
        if (d.status == 500) $log.error ('Server error');
        else $log.error (JSON.stringify (d));
    });

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
        }, function(d){
            if (d.status == 500)
                $log.error ('server error');
            else 
                $log.log (JSON.stringify (d));
        });
    };

    $scope.fetchCategory = function (category) {
        // filter existing data instead of fetching new
        $scope.selectedFilter = category;
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

    function showPurchaseSuccess () {
        $('#purchase-success').modal ({
            backdrop: 'static',
            keyboard: false
        });
    }

    $scope.buyItem = function (pId) {
        $http.post ('/order/add/'+ pId). then (function (d) {
            if (d.data.status == 'success') {
                showPurchaseSuccess ();
            }
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

    $scope.fetchOrders = function () {
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

    $scope.fetchOrders();
}]);

app.controller ('EditUserController', ['$scope','$rootScope', '$http', '$log' ,'$state', function ($scope, $rootScope, $http, $log, $state) {
    $scope.title ='Edit user information'; 

    $scope.editUserRequest = function () {
        var payload = {
            username: $rootScope.sessionInfo.username,
            password: $rootScope.sessionInfo.password,
            phone: $scope.edit.phone,
            email: $scope.edit.email,
            type: $rootScope.sessionInfo.type
        }

        $http.put ('/user/update/'+ $rootScope.sessionInfo._id, payload).then (function (d) {
            if (d.data.status == 'success') {
                $log.info ('Updated information');

                $rootScope.fetchSessionInfo ();

                $state.transitionTo ('user');
            } else
                $log.info (d.data.message);
        }, function (d) {
            if (d.status == 500) $log.error ('server error');
            else $log.error (JSON.stringify (d));
        });
    }
}]);

/**
 * the default controller
 */
app.controller ('UserController', ['$scope', '$rootScope', '$http', '$log', '$window', 'Upload', function ($scope, $rootScope, $http, $log, $window, Upload) {
    
    $rootScope.fetchSessionInfo = function (){
        $http.get ('/user/sessionInfo'). then (function (d) {
            if (d.data.status == 'success') {
                if (d.data.message.doc)
                    $rootScope.sessionInfo = d.data.message.doc;
                else
                    $rootScope.sessionInfo = d.data.message;
                console.log ($scope.sessionInfo);
            }
            else
                $window.location = '/';
        }, function (d) {
            $log.log ('ERROR: '+ d);
        });
    }

    $rootScope.fetchSessionInfo();

    $rootScope.logout = function () {
        $http.get ('/user/logout').then (function () {
            $window.location = '/';
        });
    }

    $rootScope.setImage = function (file, errFiles, id) {
        if (file) {
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

                    var nUrl = 'http://localhost:3000/user/image/'+ image.value +'/'+ image.mime;

                   location.reload ();
                }
                else
                    console.log (d.data.message);
            }, function (d) {
                console.error (JSON.stringify(d));
            });
        }
	}

    $rootScope.showEditDialogue = function() {
        showEditModal ();
    }

    $rootScope.updateUserRequest = function () {
        // console.log ($scope.edit);
        var edit = $rootScope.edit;
        console.log (edit);
		var reqData = {
			_id: $rootScope.sessionInfo._id,
			username: $rootScope.sessionInfo.username,
			email: edit.email,
			phone: edit.phone,
			password: $rootScope.sessionInfo.password,
			type: "user"
		};
		// console.log (reqData);
		$http.put ('/user/update/'+$rootScope.sessionInfo._id, reqData). then (function (d) {

			if (d.data.status == 'success') {
				console.log (d.data.data+ ' updated');
			} else
				console.error (d.data.message);

			closeEditModal();
		}, function (d) {
			console.error (JSON.stringify(d));
			closeEditModal();
		});
    }

    function showEditModal () {
        $('#edit-user-modal').modal ({
            backdrop: 'static',
            keyboard: false
        });
    }

    function closeEditModal () {
        $('#edit-user-modal').modal ('hide');
    }
}]);
