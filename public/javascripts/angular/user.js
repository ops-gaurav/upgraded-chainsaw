var app = angular.module ('user', ['ui.router', 'ngFileUpload', 'ngMask', 'ngAnimate']);

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

app.controller ('ProductsListController', ['$scope', '$rootScope', '$http', '$log', 'PaginationService', function ($scope, $rootScope, $http, $log, PaginationService) {
    $scope.pageTitle = 'We have following products for you to shop today';
    $scope.productCategories = [];
    $scope.selectedFilter = 'All';

    $scope.rawData = [];
    $scope.auxData = [];

    $scope.sortStrategy = 'Default';

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

    $scope.fetchPage = function (page) {
        if ($scope.selectedFilter == 'All') {
            $scope.pages = PaginationService.getPage ($scope.auxData.length, 5, page);
            $scope.products = $scope.auxData.slice ($scope.pages.startIndex, $scope.pages.endIndex);
        } else {
            $scope.pages = PaginationService.getPage ($scope.auxData.length, 5, page);
            $scope.products = $scope.auxData.slice ($scope.pages.startIndex, $scope.pages.endIndex);
        }
    }

    $scope.fetchProducts = function () {
        $scope.selectedFilter = "All";
        $http.get ('/product/all').then (function(d){
            if (d.data.status == 'success'){
                $scope.rawData = d.data.message;
                $scope.auxData = $scope.rawData;
                // represents the display data
                $scope.products = $scope.rawData;
                // $log.log ($scope.products);

                $scope.fetchPage (1);
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
        $scope.auxData = [];
        $scope.auxData = _productsAlias;

        $scope.fetchPage (1);

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

    $scope.priceSorting = function (type) {
        console.log (type);
        switch (type) {
            case 1:
                //low to high
                $scope.sortStrategy = "Price: Low to high";
                $scope.auxData.sort ((a,b) => {
                    return a.price-b.price;
                });
                $scope.fetchPage ($scope.pages.currentPage);
                break;
            case 2:
                // high to low
                $scope.sortStrategy = "Price: High to low";
                $scope.auxData.sort ((a,b) => {
                    return b.price-a.price;
                });

                $scope.fetchPage ($scope.pages.currentPage);
                break;
            default:
                $scope.sortStrategy = "Default";
                $scope.orders = $scope.rawData;
        }
    }
}]);

app.controller ('OrdersListController', ['$filter', '$scope', '$rootScope', '$http' , 'PaginationService' , function ($filter, $scope, $rootScope, $http, PaginationService) {
    $scope.pageTitle = 'Your recent orders';
    $scope.rawData = [];

    $scope.auxData = [];

    $scope.sortFactor = 'Default';
	var sortMap = {
		"1": 'Price: Low to high',
		"2": 'Price: High to low',
		"3": 'Date: Old first',
		"4": 'Date: New first',
		"5": 'Username'
	}

    $scope.fetchPage = function (page) {
        $scope.pages = PaginationService.getPage ($scope.rawData.length, 5, page);
        $scope.orders = $scope.auxData.slice ($scope.pages.startIndex, $scope.pages.endIndex);
    };

    $scope.fetchOrders = function () {
        $http.get ('/order/myorders').then (function (data){
            if (data.data.status == 'success' ) {
                $scope.orders = data.data.message;
                $scope.rawData = $scope.orders;
                $scope.auxData = $scope.rawData;
                //console.log ('orders: '+ JSON.stringify($scope.orders));

                // sorting on all items
                defaultSortItems();
                $scope.fetchPage (1);
            }
            else
                console.log (data.data.message);
        }, function (data){
            console.log (JSON.stringify(data));
        });
    }

    $scope.parseDate = function (millis) {
        return new Date (millis);
    }

    function defaultSortItems () {
        $scope.rawData.sort ((a,b) => {
            return b.time - a.time;
        });
    }

    $scope.sortData = function (id) {
		$scope.sortFactor = sortMap[id];
		switch (id) {
			case 1: 
				$scope.auxData.sort (function (a, b) {
					return a._product.price - b._product.price;	
				});
				break;
			case 2:
				$scope.auxData.sort (function (a, b) {
					return b._product.price - a._product.price;	
				});
				break;
			case 3:
				$scope.auxData.sort (function (a,b) {
					return a.time - b.time;
				});
				break;
			case 4:
				$scope.auxData.sort (function (a,b) {
					return b.time - a.time;
				});
				break;
			default:
				$scope.auxData = $scope.rawData;
		}

        $scope.filterDate = function () {
		if ($scope.date_from && $scope.date_to) {
			var startDate = $scope.date_from;
			var endDate = $scope.date_to;


			$scope.auxData = [];

			$.each ($scope.rawData, function (index, order) {

				var orderDate = new Date (order.time);

				if (orderDate >= startDate && orderDate <= endDate) {
					$scope.auxData.push (order);
					console.log ('push');
				}
			});

			$scope.fetchPage (1);
		}
    }

		$scope.fetchPage (1);
	}

    $scope.fetchOrders();
}]);

app.controller ('EditUserController', ['$scope','$rootScope', '$http', '$log' ,'$state', 'Upload', '$window' , function ($scope, $rootScope, $http, $log, $state, Upload, $window) {
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

    $scope.lookupPassword = function () {
        if ($scope.change.oldPass == $rootScope.sessionInfo.password) {
            $scope.changePasswordForm.oPass.$setValidity ('', true);
        } else {
            $scope.changePasswordForm.oPass.$setValidity ('', false);
        }
    }

    $scope.updatePasswordRequest = function () {
        var payload = {
            username: $rootScope.sessionInfo.username,
            password: $scope.change.newPass,
            email: $rootScope.sessionInfo.email,
            phone: $rootScope.sessionInfo.phone,
            type: $rootScope.sessionInfo.type,
            image: $rootScope.sessionInfo.image
        }
        $http.put ('/user/update/'+ $rootScope.sessionInfo._id, payload). then (function (d) {
            if (d.data.status == 'success')
                $window.location = '/';
            else
                $log.log (d.data.message);
        }, function (d) {
            if (d.status == 500)
                $log.error ('server error');
            else 
                $log.error (JSON.stringify (d));
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
                //console.log ($scope.sessionInfo);
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

                    $window.location = '/user';
                }
                else
                    console.error (d.data.message);
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


app.factory ( 'PaginationService', function () {
    return {
        getPage: function (totalItems, pageItems, currentPage) {
            // var totalItems = data.length;

            pageItems = pageItems || 5;
            currentPage = currentPage || 1;

            var totalPages = Math.ceil (totalItems/pageItems);

            var startIndex = ((currentPage - 1) * pageItems);
            var endIndex = Math.min (startIndex+pageItems, totalItems);

            var pageIndexes = [];

            if (currentPage <= 3) 
                for (var i=1; i<=6; i++)
                    if (i > totalPages) break;
                    else pageIndexes.push (i);
            else if (currentPage == totalPages)
                for (var i= totalPages-5; i<=totalPages; i++)
                    pageIndexes.push (i);
            else {
                for (var i=currentPage-3; i<=currentPage; i++)
                    pageIndexes.push (i);
                for (var i=currentPage+1;i<=currentPage+2; i++)
                    if (i > totalPages)
                        break;
                    else pageIndexes.push (i);
            }
            return {
                totalPages: totalPages,
                currentPage: currentPage,
                pageItems: pageItems,
                startIndex: startIndex,
                endIndex: endIndex,
                pages: pageIndexes
            };

        }
    }
} );