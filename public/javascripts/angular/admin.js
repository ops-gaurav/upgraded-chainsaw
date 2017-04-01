var app = angular.module ('admin', ['ui.router', 'ngFileUpload', 'ngMask']);

// app.config (['$stateProvider', '$urlRouterProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $locationProvider) {

// 	$stateProvider	
// 		.state ('dashboard', {
// 			url: '/admin',
// 			views: {
// 				'': {
// 					templateUrl: '/javascripts/angular/templates/admin/admin-template-refined.html',
// 					controller: 'AdminController'
// 				},
				
// 				'ordersList@dashboard' :{
// 					templateUrl: '/javascripts/angular/templates/admin/orders-list-template.html',
// 					controller: 'OrdersListController'
// 				},
				
// 				'usersList@dashboard': {
// 					templateUrl: '/javascripts/angular/templates/admin/users-list-template.html',
// 					controller: 'UsersListController'
// 				},

// 				'productsList@dashboard': {
// 					templateUrl: '/javascripts/angular/templates/admin/products-list-template.html',
// 					controller: 'ProductsListController'
// 				}
// 			}
// 		});

// 		$urlRouterProvider.otherwise ('/admin');

// 	$locationProvider.html5Mode ({
// 		enabled: true,
// 		requireBase: false
// 	});
// }]);

app.config (['$stateProvider', '$urlRouterProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $locationProvider) {

	$stateProvider
		// .state ('dashboard', {
		// 	url: '/admin',
		// 	views: {
		// 		'': {
		// 			templateUrl: '/javascripts/angular/templates/admin/admin-template-refined.html',
		// 			controller: 'AdminController'
		// 		},
				
		// 		'ordersList@dashboard' :{
		// 			templateUrl: '/javascripts/angular/templates/admin/orders-list-template.html',
		// 			controller: 'OrdersListController'
		// 		},
				
		// 		'usersList@dashboard': {
		// 			templateUrl: '/javascripts/angular/templates/admin/users-list-template.html',
		// 			controller: 'UsersListController'
		// 		},

		// 		'productsList@dashboard': {
		// 			templateUrl: '/javascripts/angular/templates/admin/products-list-template.html',
		// 			controller: 'ProductsListController'
		// 		}
		// 	}
		// })
		.state ('orders', {
			url: '/admin/orders',
			templateUrl: '/javascripts/angular/templates/admin/orders-list-template.html',
			controller: 'OrdersListController'
		})
		.state ('admin', {
			url: '/admin', 
			templateUrl: '/javascripts/angular/templates/admin/admin-template-refined.html',
			controller: 'AdminController'
		})
		.state ('products', {
			url: '/admin/products',
			templateUrl: '/javascripts/angular/templates/admin/products-list-template.html',
			controller: 'ProductsListController'
		})
		.state ('users', {
			url: '/admin/users',
			templateUrl: '/javascripts/angular/templates/admin/users-list-template.html',
			controller: 'UsersListController'
		})
		.state ('categories', {
			url: '/admin/categories',
			templateUrl: '/javascripts/angular/templates/admin/categories-list-template.html',
			controller: 'CategoriesListController'
		})
		.state ('category-new', {
			url: '/admin/categories/createnew',
			templateUrl: '/admin/category/new-category-template.html',
			controller: 'NewCategoryController'
		})

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
	$scope.fetchUsers = function () {
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

	$scope.fetchUsers();

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
		$('#new-user-modal').modal({
			backdrop: 'static',
			keyboard: false
		});
	}

	$scope.createUser = function () {
		$http.post ('/user/signup', {username: $scope.nUsername, password: $scope.nPassword, phone: $scope.nPhone, email: $scope.nEmail, type: $scope.nType}). then (function (d) {
			if (d.data.status =='success') {
				$scope.users.push (d.data.raw)
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

	$scope.usernameLookup = function () {
		$scope.editCheckUsername = true;

		if ($scope.edit) {
			if ($scope.edit.username && $scope.edit.username != '') {

				$http.get ('/user/usernameLookup/'+ $scope.edit.username). then (function (d){
					if (d.data.status == 'success') {
						$scope.editUSuccess = false;
						$scope.editUFailure = true;

						$scope.editCheckUsername = false;	
					} else {
						$scope.editUSuccess = true;
						$scope.editUFailure = false;
						$scope.editCheckUsername = false;
					}
				}, function (d) {
					console.error (JSON.stringify(d));
				});

			} else {
				$scope.editForm.editUsername.$setValidity ('', false);
				$scope.editUSucess = false;
			}
		} else {
			if ($scope.nUsername && $scope.nUsername != '') {

				$http.get ('/user/usernameLookup/'+ $scope.nUsername). then (function (d){
					if (d.data.status == 'success') {
						$scope.editUSuccess = false;
						$scope.editUFailure = true;

						$scope.editCheckUsername = false;	
					} else {
						$scope.editUSuccess = true;
						$scope.editUFailure = false;
						$scope.editCheckUsername = false;
					}
				}, function (d) {
					console.error (JSON.stringify(d));
				});

			} else {
				$scope.newUserForm.nUsername.$setValidity ('', false);
				$scope.editUSucess = false;

				$scope.editCheckUsername = false;
			}
		}
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
				for (var i=0; i< $scope.users.length; i++) {
					if ($scope.users[i]._id == delUser._id){
						$scope.users.splice (i, 1);
						$scope.rawData.splice (i, 1);
						break;
					}
				}
				$scope.users.splice ();
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
		$('#new-product-modal').modal ({
			backdrop: 'static',
			keyboard: false
		});
	}

	$scope.setCategory = function (category) {
		$scope.selectedCategory = category;
	}

	$scope.fetchProducts = function () {
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

	$scope.fetchProducts();

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

	$scope.editProductDialogue = function (_p) {
		$scope.edit = _p;

		showEditModal();
	}

	function showEditModal () {
		$('#edit-product-modal').modal ({
			backdrop: 'static',
			keyboard: false
		});
	}
	function hideEditModal () {
		$('#edit-product-modal').modal ('hide');
	}

	$scope.deleteConfirmation = function (product) {
		// set the global edit
		$scope.edit = product;

		showDeleteModal();
	}

	function showDeleteModal () {
		$('#delete-product-modal').modal({
			backdrop: 'static',
			keyboard: false
		});
	}

	function hideDeleteModal () {
		$('#delete-product-modal').modal ('hide');
	}

	$scope.editProductRequest = function () {
		// alert ('Update '+ $scope.edit);
		$http.put ('/product/update/'+ $scope.edit._id, {name: $scope.edit.name, price: $scope.edit.price, category: $scope.edit.category}).then (function (d) {
			if (d.data.status == 'success') {
				hideEditModal();

				$scope.edit = undefined;
			}
			else
				console.error (d.data.message);
		}, function (d) {
			console.error (JSON.stringify (d));
		});
	}

	$scope.deleteProductRequest = function () {
		$http.delete ('/product/delete/'+ $scope.edit._id). then (function (d) {
			if (d.data.status == 'success') {
				console.log ('deleted product '+ $scope.edit.name);
				for (var i=0; i< $scope.products.length; i++) {
					if ($scope.products[i]._id == $scope.edit._id){
						$scope.products.splice (i, 1);
						$scope.rawData.splice (i, 1);
						break;
					}
				}
			} else
				console.error (d.data.message``);
			hideDeleteModal();
		}, function (d) {
			console.error (JSON.stringify(d));
			hideDeleteModal();
		});
	}
}]);

app.controller ('CategoriesListController', ['$scope', '$http', function ($scope, $http) {
	$scope.title = 'Shopping Categories';

	$http.get ('/category/all'). then (function (d) {
		if (d.data.status == 'success') {
			var responseData = d.data.message;
			$scope.categoryBundle = [];
			for (var i=0; i<responseData.length; i++) {
				var categoryRow = [];
				for (var j=i; j< i+4 && j < responseData.length; j++, i++) 
					categoryRow.push (responseData[j]);
				$scope.categoryBundle.push (categoryRow);
			} 
			console.log ($scope.categoryBundle);
		} else {
			$scope.nodata = true;
		} 
	}, function (d) {

	});
}]);

app.controller ('NewCategoryController', ['$scope', '$http', '$state', function ($scope, $http, $state) {
	$scope.title = 'Create new shopping category';

	$scope.lookupCategoryValidity = function () {
		$http.get ('/category/get/'+ $scope.category).then (function (d) {
			if (d.data.status == 'success')
				$scope.unique = false;
			else
				$scope.unique = true;
		}, function (d) {
			console.error (JSON.stringify(d));
			$scope.unique = false;
		});
	}

	$scope.createNewCategory = function (){
		$http.post ('/category/add/'+ $scope.category).then (function (d) {
			if (d.data.status == 'success')
				$state.transitionTo ('categories');
			else
				console.log (d.data.message);
		}, function (d) {
			console.error (JSON.stringify(d));
			$scope.unique = false;
		});
	}

	function showEditDialogue () {
		$('#category-edit-modal').modal ({
			backdrop: 'static',
			keyboard: false
		});
	}
	function hideEditDialogue () {
		$('#category-edit-modal').modal ('hide');
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