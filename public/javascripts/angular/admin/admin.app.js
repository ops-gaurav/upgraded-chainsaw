(function (){
	angular.module ('admin', [
		'ui.router', 
		'ngFileUpload', 
		'ngMask'
	])
	.config ([
		'$stateProvider',
		'$urlRouterProvider',
		'$locationProvider',
		configurations
	]);

	// routes configuration
	function configurations ($stateProvider, $urlRouterProvider, $locationProvider) {
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
	}
})();