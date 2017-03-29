var app = angular.module ('app', [ 'ngResource' , 'ui.router' ]);
app.config (['$stateProvider', '$urlRouterProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $locationProvider) {
	$stateProvider
		.state('default', {
			url: '/',
			templateUrl: '/javascripts/angular/templates/login-template.html',
			controller: 'LoginController'
		});

	$urlRouterProvider.otherwise ('/');
	$locationProvider.html5Mode ({
		enabled: true,
		requireBase: false
	});
}]);

app.controller ('LoginController', ['$scope', '$window', '$http', 'ApplicationServices', function ($scope, $window, $http, ApplicationServices) {
	
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

app.service ('ApplicationServices', ['$resource', function ($resource) {
	this.loginAuth = function () {
		return $resource ('/user/auth', {username: '@username', password: '@password'}, {
			authenticate: { method: 'POST' }
		});
	};

	this.signup = function () {
		return $resource ('/user/signup', {username: '@username', password: '@password', phone: '@phone', email: '@email'}, {
			persist: { method: 'POST' }
		});
	}
}]);