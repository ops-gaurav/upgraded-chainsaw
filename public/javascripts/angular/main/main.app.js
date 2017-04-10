(function (){
	angular.module ('app', ['ui.router', 'ngMask'])
		.config ([
			'$stateProvider',
			'$urlRouterProvider',
			'$locationProvider',
			configurations
		]);

	function configurations ($stateProvider, $urlRouterProvider, $locationProvider) {
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
	}
})();