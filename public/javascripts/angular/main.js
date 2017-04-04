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
