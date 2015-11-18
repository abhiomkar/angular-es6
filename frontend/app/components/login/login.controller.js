import _ from 'lodash';
import angular from 'angular';

class LoginController {
	constructor($scope, $element, $location, $window, $rootScope, $http, $q, $timeout) {
    this.name = 'login';
		let hasPassword = false;

		$scope.error = {};
		let $signInModal = $element.find("#signInModal");

		$scope.$on("SHOW_SIGNIN", function(event, args) {
			$scope.showSignin();
		});

		$scope.logIn = () => {
			$scope.progressing = true;

			// TODO
			// handle timeout - network disconnect issues
			if ($scope.signInChecked) {
				// Has Password
				if (hasPassword) {
					$http.post("/api/auth/signin", {mobile: $scope.phonenumber, password: $scope.password})
					.then((response) => {
						$scope.progressing = false;

						let data = response.data;
						console.log('hasPassword - data: ', data);

						if (data.error) {
							$scope.error.password = data.statusMessage;
						}
						else {
							$scope.error = {};
							$scope.errorMsg = '';

							// Successfully Logged
							$scope.hideSignin();
							window.location.reload();
						}
					});
				}
				// Doesn't has password - Verify OTP
				else {
					$http.get("/api/auth/otp-verify?otp=" + $scope.otp)
					.then((response) => {
						$scope.progressing = false;

						console.log('otp-verify: ', response);

						let data = response.data;

						if (data.error) {
							$scope.error.otp = data.statusMessage;
						}
						else if (data.success) {
							$scope.hideSignin();

							if (!hasPassword) {
								$scope.showCreatePassword();
							}
						}
					});
				}
			}
			else {
				$http.get("/api/auth/signin-check?mobile=" + $scope.phonenumber)
				.then((response) => {
					let data = response.data;
					console.log(response);
					$scope.progressing = false;
					$scope.errorMsg = '';
					$scope.error = {};

					if (data.error) {
						$scope.errorMsg = data.statusMessage;
						$scope.modalBodyHeight += $signInModal.find(".alert").outerHeight(true);
						$scope.signInChecked = false;
					}
					else if (!data.data.registered) {
						$scope.error.phonenumber = "Sorry, your mobile number is not registered with us.";
						$scope.signInChecked = false;
					}
					else if (data.success && data.data.registered) {
						$scope.signInChecked = true;
						hasPassword = data.data.passwordEnabled;

						if (data.data.passwordEnabled && data.data.verified === true) {
							// has password

							$signInModal.find('.form-panel.first').addClass('slide-out');
							$signInModal.find('.form-panel.second').addClass('slide-in');
							$timeout(() => {
								$signInModal.find('.form-panel.second input').focus();
							}, 200);

							$scope.modalBodyHeight = $signInModal.find('.form-panel.second').outerHeight(true) + 50;
						}
						else if (data.data.verified === false || data.data.passwordEnabled === false) {
							// doesn't have password - proceed to OTP Verification

							// show OTP Verification input
							$signInModal.find('.form-panel.first').addClass('slide-out');
							$signInModal.find('.form-panel.third').addClass('slide-in');
							$timeout(() => {
								$signInModal.find('.form-panel.third input').focus();
							}, 200);

							$scope.modalBodyHeight = $signInModal.find('.form-panel.third').outerHeight(true) + 50;

							$http.get("/api/auth/sms-otp?mobile=" + $scope.phonenumber)
							.then((response) => {
								console.log('sms-otp: ', response);
								$scope.progressing = false;
								let data = response.data;

								if (data.success) {
									$scope.showVerifyViaCall = false;

									$timeout(() => {
										$scope.showVerifyViaCall = true;
										$scope.modalBodyHeight = $signInModal.find('.form-panel.third').outerHeight(true) + 50 + 35;
									}, 1000 * 30);
								}
								else if (data.error) {
									// TODO: show errorMsg when this API fails
									$scope.error.otp = data.statusMessage;
								}
							});
						}
					}
				});
			}
		};

		$scope.signUp = () => {
			let params = {
					mobile: $scope.phonenumber,
					name: $scope.fullname,
					terms: $scope.acceptTerms,
					email: $scope.email,
					password: $scope.password
			};

			$scope.progressing = true;

			// TODO:
			// handle timeouts / server errors

			$http.post('/api/auth/signup', params)
			.then((response) => {
				console.log(response);
				$scope.progressing = false;

				let data = response.data;

				if (data.error) {

					if (data.error === true) {
						$scope.errorMsg = data.statusMessage;
					}
					else {
						$scope.error.phonenumber = data.error.mobile;
						$scope.error.email = data.error.email;
						$scope.error.password = data.error.password;
						$scope.error.acceptTerms = data.error.terms;
						$scope.error.fullname = data.error.name;
					}
				}
				else if (data.success) {
					$scope.fullname = $scope.phonenumber = $scope.email = $scope.password = $scope.acceptTerms = '';

					$scope.hideSignup();
					// sign-up service automatically sends the OTP to mobile
					$scope.showVerification($scope.thankYouForSigningUp);

					$scope.showVerifyViaCall = false;

					$timeout(() => {
						$scope.showVerifyViaCall = true;
					}, 1000 * 30);
				}
			});
		};

		$scope.thankYouForSigningUp = () => {
			$scope.hideVerification();
			$scope.showVerificationSuccessful("Verification Successful!", "Thank you for signing up.");
		};

		$scope.verifyOTP = (callback) => {
			$scope.progressing = true;

			$http.get("/api/auth/otp-verify?otp=" + $scope.otp)
			.then((response) => {
				$scope.progressing = false;
				let data = response.data;

				if (data.error) {
					$scope.error.otp = data.statusMessage;
				}
				else if (data.success) {
					$scope.hideVerification();
					callback();
				}
			});
		};

		$scope.sendOTP = () => {
			$http.get("/api/auth/sms-otp?mobile=" + $scope.phonenumber)
			.then((response) => {
				$scope.progressing = false;
				let data = response.data;

				if (data.success) {
					$scope.showVerifyViaCall = false;

					$timeout(() => {
						$scope.showVerifyViaCall = true;
					}, 1000 * 30);
				}
				else if (data.error) {
					// TODO: show errorMsg when this API fails
					$scope.error.otp = data.statusMessage;
				}
			});
		};

		$scope.createp = (successMessage) => {
			let params = { password: $scope.password };

			$scope.progressing = true;

			console.log('createp');

			$http.post("/api/auth/set-password", params)
			.then((response) => {
				$scope.progressing = false;
				let data = response.data;

				console.log(response);

				if (data.error) {
					$scope.errorMsg = data.statusMessage;
				}
				else if (data.success) {
					$scope.hideModal("#createPassword");
					$scope.hideModal("#forgotPassword");

					$scope.showVerificationSuccessful(successMessage);
				}
			});
		};

		let pollCallAuthVerify = function(callback) {
			let callVerificationSuccessful = false;

			function _interval() {
				$timeout(() => {


					$http.get("/api/auth/call-auth-verify")
					.then((response) => {
						console.log(response);

						if (response.data.success) {
							callVerificationSuccessful = true;

							$scope.hideVerifyViaCall();

							callback();
						}
					});

					console.log(callVerificationSuccessful, $scope.callAuthVerifyTimeExpired);

					if (!callVerificationSuccessful && !$scope.callAuthVerifyTimeExpired) {
						_interval();
					}
				}, 1500);
			}

			_interval();
		};

		$scope.verifyViaCall = (callback) => {
			$http.get("/api/auth/call-auth")
			.then((response) => {
				console.log(response);
				if (response.data.success) {
					$scope.hideSignin();
					$scope.hideVerification();
					$scope.verifyViaCallStatusHeader = "Calling...";
					$scope.showModal("#verifyViaCall");

					// start the timer - 90 sec
					$scope.startTimer(90, $element.find("#verifyViaCall .remaining-time")[0], function() {
						$scope.callAuthVerifyTimeExpired = true;
						$scope.verifyViaCallStatusHeader = "Verification Failed!";
						$scope.$apply();
					});

					// start polling to verify via call
					pollCallAuthVerify(callback);
				}
				else if (response.data.error) {

				}
			});
		};

		$scope.logOut = () => {
			$http.post("/api/auth/logout")
			.then((response) => {
				console.log(response);

				if (response.data.success) {
					window.location.reload();
				}
			});
		};
  }
}

LoginController.$inject = ["$scope", "$element", "$location", "$window", "$rootScope", "$http", "$q", "$timeout"];

export default LoginController;
