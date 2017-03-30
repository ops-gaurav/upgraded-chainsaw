var app = angular.module ('admin', ['ui.router', 'ngFileUpload']);

app.config (['$stateProvider', '$urlRouterProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $locationProvider) {

	$stateProvider	
		.state ('dashboard', {
			url: '/admin',
			views: {
				'': {
					templateUrl: '/javascripts/angular/templates/admin/admin-template.html',
					controller: 'AdminController'
				},
				
				'ordersList@dashboard' :{
					templateUrl: '/javascripts/angular/templates/admin/orders-list-template.html',
					controller: 'OrdersListController'
				},
				
				'usersList@dashboard': {
					templateUrl: '/javascripts/angular/templates/admin/users-list-template.html',
					controller: 'UsersListController'
				},

				'productsList@dashboard': {
					templateUrl: '/javascripts/angular/templates/admin/products-list-template.html',
					controller: 'ProductsListController'
				}
			}
		});

		$urlRouterProvider.otherwise ('/admin');

	$locationProvider.html5Mode ({
		enabled: true,
		requireBase: false
	});
}]);

app.controller ('OrdersListController', ['$scope', '$rootScope', '$http', function ($scope, $rootScope, $http){
	// load all the orders here

	$scope.orders = [];
	$scope.rawData = [];

	$scope.sortFactor = 'Default';
	var sortMap = {
		"1": 'Price: Low to high',
		"2": 'Price: High to low',
		"3": 'Date: Old first',
		"4": 'Date: New first',
		"5": 'Username'
	}

	$http.get ('/order/multiPopulate').then (function (data) {
		var response = data.data;
		$scope.orders = response;

		$scope.rawData = $scope.orders;
		//$rootScope.fetchUsers();
	}, function (data) {
		console.log ('ERROR: '+ JSON.stringify (data));
		// $rootScope.fetchUsers();
	});

	$scope.sortData = function (id) {
		$scope.sortFactor = sortMap[id];
		switch (id) {
			case 1: 
				$scope.orders.sort (function (a, b) {
						return a._product.price - b._product.price;	
				});
				break;
			case 2:
				$scope.orders.sort (function (a, b) {
					return b._product.price - a._product.price;	
				});
				break;
			case 3:
				$scope.orders.sort (function (a,b) {
					return a.time - b.time;
				});
				break;
			case 4:
				$scope.orders.sort (function (a,b) {
					return b.time - a.time;
				});
				break;
			// case 5:
			// 	console.log ('sorting by username');
			// 	break;
			default:
				$scope.orders = $scope.rawData;
		}
	}

	$scope.title = 'All Orders';

	$scope.parseDate = function (timestamp) {
		var date = new Date (timestamp);
		return date;
	}
}]);

app.controller ('UsersListController', ['$scope', '$rootScope', '$http', function ($scope, $rootScope, $http) {
	// load alll the users here
	$scope.title = 'All users';

	$scope.selectedUser = 'All';

	$scope.users = []
	$scope.rawData = [];
	// call one after another
	// call after all the orders have been loaded
	$rootScope.fetchUsers = function () {
		console.log ('fetching users');
		$http.get ('/user/all').then (function (data) {
			if (data.data.status =='success') {
				$scope.users = data.data.message;
				$scope.rawData = $scope.users;
				console.log ($scope.users);
			} else
				console.log (data.data.message);

			$rootScope.fetchProducts();
		}, function (data) {
			console.error (JSON.stringify (data));
			$rootScope.fetchProducts();
		});
	}

	$rootScope.fetchUsers();

	$scope.filterUser = function (userType) {
		$scope.selectedUser = 'All';
		if (userType == 'All') {
			$scope.users = $scope.rawData;
		} else {
			var _alias = [];
			for (var i=0; i<$scope.rawData.length; i++) {
				var p = $scope.rawData[i];
				if (p.type == userType)
					_alias.push (p);
			}
			$scope.users = _alias;
		}
	}

	$scope.showNewUserModal = function() {
		$('#new-user-modal').modal();
	}

	$scope.createUser = function () {
		$http.post ('/user/signup', {username: $scope.nUsername, password: $scope.nPassword, phone: $scope.nPhone, email: $scope.nEmail, type: $scope.nType}). then (function (d) {
			if (d.data.status =='success') {
				$scope.users.push (d.data.raw);
				$('#new-user-modal').modal ('hide');
			} else
				console.log (d.data.message);
		}, function (d) {
			console.error (JSON.stringify(d));
		});
	}

	$scope.editUser = function (user) {
		$scope.edit = user;

		if ($scope.edit) {
			$('#edit-user-modal').modal({
				backdrop: 'static',
				keyboard: false
			});
		}
	}

	$scope.closeEditModal = function () {
		$scope.edit = {};
		$('#edit-user-modal').modal ('hide');
	}

	$scope.updateUser = function (edit) {
		// console.log ($scope.edit);
		var reqData = {
			_id: edit._id,
			username: edit.username,
			email: edit.email,
			phone: edit.phone,
			password: edit.password,
			type: edit.type
		};
		// console.log (reqData);
		$http.put ('/user/update/'+edit._id, reqData). then (function (d) {

			if (d.data.status == 'success') {
				console.log (d.data.data+ ' updated');
			} else
				console.error (d.data.message);

			$scope.closeEditModal();
		}, function (d) {
			console.error (JSON.stringify(d));
			$scope.closeEditModal();
		});
	}

	$scope.deleteConfirmation = function (user) {
		$scope.delUser = user;
		$('#delete-user-modal').modal ({
			backdrop: 'static',
			keyboard: false
		});
	}

	$scope.hideDelConfirmation= function () {
		$('#delete-user-modal').modal ('hide');
	}

	$scope.deleteUser = function (delUser) {
		alert ('delete user '+ delUser._id);

		$http.delete ('/user/delete	/'+ delUser._id). then (function (d) {
			if (d.data.status == 'success')
			{
				console.log ('deleted user '+ delUser.username);
				$scope.fetchUsers();
			} else	console.error (d.data.message);

			$scope.hideDelConfirmation();
		}, function (d) {
			console.error (JSON.stringify(d));
			$scope.hideDelConfirmation();
		});
	};
}]);

app.controller ('ProductsListController', ['$scope', '$rootScope', '$http', 'Upload', function ($scope, $rootScope, $http, Upload) {
	$scope.title = 'All products';
	$scope.productCategories = [ 'Accessory', 'Electronics' , 'Art', 'Sports'];
	$scope.selectedCategory = 'All';

	$scope.rawData = [];

	$scope.products = [];
	$scope.newProductModal = function () {
		$('#new-product-modal').modal ();
	}

	$scope.setCategory = function (category) {
		$scope.selectedCategory = category;
	}

	$rootScope.fetchProducts = function () {
		console.log ('fetching products');
		$http.get ('/product/all').then (function(d){
			if (d.data.status == 'success') {
				$scope.rawData = d.data.data;
				$scope.products = $scope.rawData;
				console.log ($scope.products);
			}
			else
				console.log (d.data.message);
		}, function(d){
			if (d.status == 500)
				console.error ('Server error');
			else
				console.error (JSON.stringify (d));
		});
	}

	// filter items by category
	$scope.fetchCategory = function (category) {
		$scope.selectedCategory = category;
		if (category == 'Accessory'){
			$scope.selectedCategory = 'All';
		}
		else{
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
    }

	//$scope.fetchProducts();

	$scope.setImage = function (file, errFiles, id) {
		$scope.file = {};
		$scope.file[id] = file;

		var url ='/product/addImage/'+ id;
		// process saving file
		Upload.upload ({
			url: url,
			method: 'PUT',
			data: {avatar: file}
		}). then (function (d){
			if (d.data.status == 'success') {
				var image = d.data.data.image;
				var nUrl = 'http://localhost:3000/product/image/'+ image.value +'/'+ image.mime;
				console.log (nUrl);	
				$('.'+id).attr ('src', nUrl);
			}
			else
				console.log (d.data.message);
		}, function (d) {
			console.error (JSON.stringify(d));
		});
		//$scope.file = file;
	}

	$scope.createProduct = function () {
		$http.post ('/product/add', {name: $scope.pName, price: $scope.pPrice, category: $scope.selectedCategory}).then (function (d) {
			if (d.data.status == 'success') {
				$('#new-product-modal').modal ('hide');
				$scope.products.push (d.data.raw);
			} else
				console.log (d.data.message);
		}, function (data) {
			console.error ("ERROR: "+ JSON.stringify (data));
		});
	}
}]);

app.controller ('AdminController', ['$rootScope', '$http', '$window', '$state', function ($rootScope, $http, $window, $state) {
	$http.get ('/user/sessioninfo'). then (function (data) {
		var response = data.data;
		if (response.status == 'success') {
			$rootScope.sessionInfo = response.message.doc;
		} else {
			$window.location = '/';
		}
	}, function (data) {
		console.error (data);
	});

	$rootScope.logout = function () {
		$http.get ('/user/logout').then (function () {
			$window.location = '/';
		});
	}
}]);