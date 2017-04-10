(function (){
	angular
		.module ('app')
		.controller ('LoginController', [
			'$scope',
			'$window',
			'$http',
			'$log',
			loginController
		])
		.controller ('SignupController', [
			'$scope',
			'$window',
			'$http',
			signupController
		])

	function loginController ($scope, $window, $http, $log) {
		$scope.username = 'gaurav';
		$scope.password = '2202319';
		$scope._processAuth = function () {

			$log.log ('authenticate');
			if (!$scope.username || !$scope.password) {
				$scope.auth_error = 'Required username and password';
			} else {
				$http.post ('/user/auth', {username: $scope.username, password: $scope.password}). then (function (data) {
					var response = data.data;
					if (response.status == 'success') {
						$window.location = response.message.redirect;
						$log.log ('redirect to '+ response.message.redirect);
					} else
						$log.log (response.message);
				}, function (data) {
					$log.error (data.status);
					if (data.status == 401)
						$scope.auth_error = 'Username or password error';
					else
						$log.log (JSON.stringify(data));
				});
			}
		}
	}

	function signupController ($scope, $window, $http) {
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
	}
})();