(function (){
	angular.module ('user', [
		'ui.router',
		'ngFileUpload',
		'ngMask'
	])
	.config ([
		'$stateProvider',
		'$urlRouterProvider',
		'$locationProvider',
		configurations
	])

	function configurations ($stateProvider, $urlRouterProvider, $locationProvider) {
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
	}
})();