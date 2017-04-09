angular
	.module ('admin', [
		'ui.router', 
		'ngFileUpload', 
		'ngMask'
	])
	.config ([
		'$stateProvider', 
		'$urlRouterProvider', 
		'$locationProvider', 
		function ($stateProvider, $urlRouterProvider, $locationProvider) {

			$stateProvider
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
				.state ('product-new', {
					url: '/admin/product/new',
					templateUrl: '/admin/products/new-product-template.html',
					controller: 'NewProductController'
				});

			$urlRouterProvider.otherwise ('/admin');

			$locationProvider.html5Mode ({
				enabled: true,
				requireBase: false
			});
	}])	// end of config
	.controller ('OrdersListController', [
		'$scope', 
		'$rootScope', 
		'$http', 
		'$log',
		'PaginationService', 
		function ($scope, $rootScope, $http, $log, PaginationService){
			// load all the orders here

			$scope.orders = [];
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
				$scope.pages = PaginationService.getPage ($scope.auxData.length, 5, page);

				$scope.orders = $scope.auxData.slice ($scope.pages.startIndex, $scope.pages.endIndex);
			}

			$http.get ('/order/multiPopulate').then (function (data) {
				var response = data.data.message;
				$scope.orders = response;

				// console.log (response);

				$scope.rawData = $scope.orders
				$scope.auxData = $scope.rawData;
				
				$scope.fetchPage (1);
				//$rootScope.fetchUsers();
			}, function (data) {
				$log.log ('ERROR: '+ JSON.stringify (data));
				// $rootScope.fetchUsers();
			});

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
					// case 5:
					// 	console.log ('sorting by username');
					// 	break;
					default:
						$scope.auxData = $scope.rawData;
				}

				$scope.fetchPage (1);
			}

			$scope.title = 'All Orders';

			$scope.parseDate = function (timestamp) {
				var date = new Date (timestamp);
				return date;
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
							// $log.log ('push');
						}
					});

					$scope.fetchPage (1);
				}
			}
	}]) // end of ordersList controller
	.controller ('UsersListController', [
		'$scope', 
		'$rootScope', 
		'$http', 
		'$log',
		'PaginationService', function ($scope, $rootScope, $http, $log, PaginationService) {
			// load alll the users here
			$scope.title = 'All users';

			$scope.selectedUser = 'All';

			$scope.users = []
			$scope.rawData = [];
			$scope.auxData = [];

			$scope.fetchPage = function (page) {
				$scope.pages = PaginationService.getPage ($scope.auxData.length, 5, page);
				$scope.users = $scope.auxData.slice ($scope.pages.startIndex, $scope.pages.endIndex);
			}

			// call one after another
			// call after all the orders have been loaded
			$scope.fetchUsers = function () {
				$log.log ('fetching users');
				$http.get ('/user/all').then (function (data) {
					if (data.data.status =='success') {
						$scope.users = data.data.message;
						$scope.rawData = $scope.users;
						$scope.auxData = $scope.rawData;
						//console.log ($scope.users);

						$scope.fetchPage (1);
					} else
						$log.log (data.data.message);

					// $rootScope.fetchProducts();
				}, function (data) {
					$log.error (JSON.stringify (data));
					// $rootScope.fetchProducts();
				});
			}

			$scope.fetchUsers();

			$scope.filterUser = function (userType) {
				$scope.selectedUser = userType;

				if (userType == 'All') {
					$scope.auxData = $scope.rawData;
				} else {
					var _alias = [];
					for (var i=0; i<$scope.rawData.length; i++) {
						var p = $scope.rawData[i];
						if (p.type == userType)
							_alias.push (p);
					}
					$scope.auxData = _alias;
				}

				$scope.fetchPage (1);
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
						$log.log (d.data.message);
				}, function (d) {
					$log.error (JSON.stringify(d));
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
							$log.error (JSON.stringify(d));
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
							$log.error (JSON.stringify(d));
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
						$log.log (d.data.data+ ' updated');
					} else
						$log.error (d.data.message);

					$scope.closeEditModal();
				}, function (d) {
					$log.error (JSON.stringify(d));
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
						$log.log ('deleted user '+ delUser.username);
						for (var i=0; i< $scope.users.length; i++) {
							if ($scope.users[i]._id == delUser._id){
								$scope.users.splice (i, 1);
								$scope.rawData.splice (i, 1);
								break;
							}
						}
						$scope.users.splice ();
					} else	$log.error (d.data.message);

					$scope.hideDelConfirmation();
				}, function (d) {
					$log.error (JSON.stringify(d));
					$scope.hideDelConfirmation();
				});
			};
	}])	// end of UsersListController
	
	.controller ('ProductsListController', [
		'$scope', 
		'$rootScope', 
		'$http', 
		'$log',
		'Upload',
		'PaginationService', function ($scope, $rootScope, $http, $log , Upload, PaginationService) {
			$scope.title = 'All products';
			// $scope.productCategories = [ 'Accessory', 'Electronics' , 'Art', 'Sports'];
			$scope.productCategories = [];

			$http.get ('/category/all'). then (function (d) {
				if (d.data.status == 'success') {
					var response = d.data.message;
					response.forEach (item => $scope.productCategories.push (item.name));
				} else
					$scope.productCategories.push ('Accessory');
			}, function (d) {
				
			});
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

			$scope.fetchPage = function  (page) {
				$scope.pages = PaginationService.getPage ($scope.rawData.length, 5, page);
				$scope.products = $scope.rawData.slice ($scope.pages.startIndex, $scope.pages.endIndex);
			}

			$scope.fetchProducts = function () {
				$log.log ('fetching products');
				$http.get ('/product/all').then (function(d){
					if (d.data.status == 'success') {
						$scope.rawData = d.data.message;
						$scope.products = $scope.rawData;

						$scope.fetchPage (1);
						// console.log ($scope.products);
					}
					else
						$log.log (d.data.message);
				}, function(d){
					if (d.status == 500)
						$log.error ('Server error');
					else
						$log.error (JSON.stringify (d));
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
						$log.log (nUrl);	
						$('.'+id).attr ('src', nUrl);
					}
					else
						$log.log (d.data.message);
				}, function (d) {
					$log.error (JSON.stringify(d));
				});
				//$scope.file = file;
			}

			$scope.createProduct = function () {
				$http.post ('/product/add', {name: $scope.pName, price: $scope.pPrice, category: $scope.selectedCategory}).then (function (d) {
					if (d.data.status == 'success') {
						$('#new-product-modal').modal ('hide');
						$scope.products.push (d.data.raw);
					} else
						$log.log (d.data.message);
				}, function (data) {
					$log.error ("ERROR: "+ JSON.stringify (data));
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
						$log.error (d.data.message);
				}, function (d) {
					$log.error (JSON.stringify (d));
				});
			}

			$scope.deleteProductRequest = function () {
				$http.delete ('/product/delete/'+ $scope.edit._id). then (function (d) {
					if (d.data.status == 'success') {
						$log.log ('deleted product '+ $scope.edit.name);
						for (var i=0; i< $scope.products.length; i++) {
							if ($scope.products[i]._id == $scope.edit._id){
								$scope.products.splice (i, 1);
								$scope.rawData.splice (i, 1);
								break;
							}
						}
					} else
						$log.error (d.data.message``);
					hideDeleteModal();
				}, function (d) {
					$log.error (JSON.stringify(d));
					hideDeleteModal();
				});
			}
	}])	// end of ProductsListcontroller

	// NEW PRODUCTS CONTROLLER
	.controller ('NewProductController', [
		'$scope',
		'$http', 
		'$log', 
		'$state', function ($scope, $http, $log, $state) {
			$scope.title ='New product';

			$scope.changeCategory = function (category){
				$scope.selectedCategory = category;
			}

			// fetch all the categories to be available under the dropdown
			$http.get ('/category/all'). then (function (d) {
				if (d.data.status == 'success') {
					var response = d.data.message;
					$scope.productCategories = [];
					if (response && response.length > 0)  response.forEach (item => $scope.productCategories.push (item.name));
					else $scope.productCategories.push ('Accessory');
					
					// set the default category item
					$scope.selectedCategory = $scope.productCategories[0];
				} else $log.error (d.data.message);
			}, function (d) {
				if (d.status == 500)
					$log.error ('Server errr');
				else
					$log.error (JSON.stringify (d));
			}); 

			$scope.createProductRequest = function () {
				console.log ($scope.pName+ '\t'+ $scope.pPrice +'\t'+ $scope.selectedCategory);
				var payload = {
					name: $scope.pName,
					price: $scope.pPrice,
					category: $scope.selectedCategory
				};

				$http.post ('/product/add', payload). then (function (d) {
					if (d.data.status == 'success')
						$state.transitionTo ('products');
					else
						$log.error (d.data.message);
				}, function (d) {
					if (d.status == 500) $log.error ('Server error');
					else $log.error (JSON.stringify (d));

				});
			}
	}])		// end of new product controller
	
	// CATEGORIES LIST CONTROLLER
	.controller ('CategoriesListController', [
		'$scope', 
		'$http', 
		'$log',
		'$state', function ($scope, $http, $log , $state) {
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
					$log.log ($scope.categoryBundle);
				} else {
					$scope.nodata = true;
				} 
			}, function (d) {
				$log.error (JSON.stringify(d));
			});

			$scope.lookupCategoryValidity = function () {
				$http.get ('/category/get/'+ $scope.edit.editedName).then (function (d) {
					if (d.data.status == 'success')
						$scope.unique = false;
					else
						$scope.unique = true;
				}, function (d) {
					$log.error (JSON.stringify(d));
					$scope.unique = false;
				});
			}

			$scope.editCategory = function (category) {
				$scope.edit = category;
				showEditDialogue();
				// alert('here');
			}

			// send a request to update  category
			$scope.editCategoryRequest = function () {
				$http.put ('/category/update/'+ $scope.edit._id+'/'+ $scope.edit.editedName). then (function (d) {
					if (d.data.status == 'success') {
						hideEditDialogue();
						// $state.transitionTo ('categories');
						// update the $scope.categoryBundle to find the object with id $scope.edit._id

						var breakWhole = true;
						for (var i=0; i< $scope.categoryBundle.length; i++) {
							var categoryRow = $scope.categoryBundle [i];
							for (var j=0; j<categoryRow.length; j++) {
								var current = categoryRow[j];
								if (current._id == $scope.edit._id) {
									current.name = $scope.edit.editedName;
									breakWhole = true;
									break;
								}
								categoryRow[j] = current;
							}
							$scope.categoryBundle[i] = categoryRow;
							if (breakWhole)
								break;
						}
					} else
						$log.error (d.data.message);
				}, function (d) {
					$log.error (JSON.stringify (d));
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
	}])	// end of Categories List controller

	// NEW CATEGORY CONTROLLER
	.controller ('NewCategoryController', [
		'$scope', 
		'$http', 
		'$log',
		'$state', function ($scope, $http,$log , $state) {
			$scope.title = 'Create new shopping category';

			$scope.lookupCategoryValidity = function () {
				$http.get ('/category/get/'+ $scope.category).then (function (d) {
					if (d.data.status == 'success')
						$scope.unique = false;
					else
						$scope.unique = true;
				}, function (d) {
					$log.error (JSON.stringify(d));
					$scope.unique = false;
				});
			}

			$scope.createNewCategory = function (){
				// $log.log ($scope.category);
				$http.post ('/category/add/'+ $scope.category).then (function (d) {
					if (d.data.status == 'success')
						$state.transitionTo ('categories');
					else
						$log.log (d.data.message);
				}, function (d) {
					$log.error (JSON.stringify(d));
					$scope.unique = false;
				});
			}
	}])	// End of new category controller

	// ADMIN CONTROLLER
	.controller ('AdminController', [
		'$rootScope', 
		'$http', 
		'$log',
		'$window', 
		'$state', function ($rootScope, $http, $log, $window, $state) {
			$http.get ('/user/sessioninfo'). then (function (data) {
				var response = data.data;
				if (response.status == 'success') {
					$rootScope.sessionInfo = response.message.doc;
				} else {
					$window.location = '/';
				}
			}, function (data) {
				$log.error (data);
			});

			$rootScope.logout = function () {
				$http.get ('/user/logout').then (function () {
					$window.location = '/';
				});
			}

			$rootScope.usersCount = function () {
				$http.get ('/user/all'). then (function (d){
					if (d.data.status == 'success')
						$rootScope.totalUsers = d.data.message.length;
					else if (d.data.status == 'error')
						$rootScope.totalUsers = 0;
				}, function (d) {
					if (d.status == 500)
						$log.error ('Server error');
					else $log.error (JSON.stringify (d));
				});
			}

			$rootScope.productsCount = function () {
				$http.get ('/product/all'). then (function (d){
					if (d.data.status == 'success')
						$rootScope.totalProducts = d.data.message.length;
					else if (d.data.status == 'error')
						$rootScope.totalUsers = 0;
				}, function (d) {
					if (d.status == 500)
						$log.error ('Server error');
					else $log.error (JSON.stringify (d));
				});
			}

			$rootScope.ordersCount = function () {
				$http.get ('/order/all'). then (function (d){
					if (d.data.status == 'success')
						$rootScope.totalOrders = d.data.message.length;
					else if (d.data.status == 'error')
						$rootScope.totalUsers = 0;
				}, function (d) {
					if (d.status == 500)
						$log.error ('Server error');
					else $log.error (JSON.stringify (d));
				});
			}

			$rootScope.usersCount ();
			$rootScope.productsCount ();
			$rootScope.ordersCount();
	}])	// end of admin controller

	/**
	 * FACTORIES implementation here
	 */
	.factory ( 'PaginationService', function () {
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
	});
var app = angular.module ('app', [  'ui.router', 'ngMask' ]);
app.config (['$stateProvider', '$urlRouterProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $locationProvider) {
	$stateProvider
		.state('default', {
			url: '/',
			templateUrl: '/javascripts/angular/templates/login-template.html',
			controller: 'LoginController'
		})
		.state ('/signup', {
			url: '/signup',
			templateUrl: '/javascripts/angular/templates/register-template.html',
			controller: 'SignupController'
		});

	$urlRouterProvider.otherwise ('/');
	$locationProvider.html5Mode ({
		enabled: true,
		requireBase: false
	});
}]);

app.controller ('LoginController', ['$scope', '$window', '$http', function ($scope, $window, $http) {
	
	$scope.username = 'gaurav';
	$scope.password = '2202319';
	$scope._processAuth = function () {
		if (!$scope.username || !$scope.password) {
			$scope.auth_error = 'Required username and password';
		} else {
			$scope.auth_error = 'Username or password error';
			$http.post ('/user/auth', {username: $scope.username, password: $scope.password}). then (function (data) {
				var response = data.data;
				if (response.status == 'success') {
					$window.location = response.message.redirect;
					console.log ('redirect to '+ response.message.redirect);
				} else
					console.log (response.message);
			}, function (data) {
				if (data.status == 401)
					$scope.auth_error = 'Username or password error';
				else
					console.log (JSON.stringify(data));
			});
		}
	}
}]);

app.controller ('SignupController', ['$scope', '$window', '$http', function ($scope, $window, $http) {
	
	/**
	 * lookup for existance of user in database
	 */
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

	$scope.createUser = function () {
		$http.post ('/user/signup', {username: $scope.nUsername, password: $scope.nPassword, phone: $scope.nPhone, email: $scope.nEmail, type: $scope.nType}). then (function (d) {
			if (d.data.status =='success') {
				$scope.success = 'User created sucessfully. redirecting to login';
				$window.location = '/';
			} else
				console.log (d.data.message);
		}, function (d) {
			console.error (JSON.stringify(d));
		});
	}

}]);

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