import template from './login.html';
import controller from './login.controller';
import './login.css';

let loginComponent = function($timeout){
	return {
		template,
		controller,
		restrict: 'E',
		controllerAs: 'vm',
		link: function(scope, element, attrs) {

			scope.errorMsg = '';
			console.log(attrs.isLoggedIn);
			console.log(attrs.userName);

			scope.isLoggedIn = attrs.isloggedin;
			scope.userName = attrs.username;

			let $signInModal = element.find("#signInModal");
			let $signUpModal = element.find("#signUpModal");

			scope.goBackSignin = () => {
				scope.errorMsg = '';
				scope.error = {};
				scope.signInChecked = false;
				scope.progressing = false;

				$signInModal.find('.form-panel.first').removeClass('slide-out');
				$signInModal.find('.form-panel.second').removeClass('slide-in');
				$signInModal.find('.form-panel.third').removeClass('slide-in');

				$timeout(() => {
					scope.modalBodyHeight = $signInModal.find('.form-panel.first').outerHeight(true);
					$signInModal.find('.form-panel.first').focus();
				}, 200);

			};

			scope.hideSignin = () => {
				$signInModal.modal('hide');
			};

			scope.resetFields = () => {
				scope.phonenumber = scope.fullname = scope.otp = scope.password = scope.email = scope.password = '';
			};

			scope.showSignin = () => {
	      let options = {};
				scope.errorMsg = '';
				scope.signInChecked = false;
				scope.progressing = false;
				scope.error = {};
				scope.showVerifyViaCall = false;

				scope.resetFields();

				element.find("#signUpModal").modal('hide');
				$signInModal.find('.form-panel.first').removeClass('slide-out');
				$signInModal.find('.form-panel.second').removeClass('slide-in');
				$signInModal.find('.form-panel.third').removeClass('slide-in');

	      $signInModal.modal(options);

				$timeout(() => {
					scope.modalBodyHeight = $signInModal.find('.form-panel.first').outerHeight(true);
					$signInModal.find('.form-panel.first').focus();
				}, 200);
	    };

			scope.hideSignup = () => {
				$signUpModal.modal('hide');
			};

	    scope.showSignup = () => {
	      let options = {};
	      scope.password = '';
				scope.errorMsg = '';
				scope.error = {};
				scope.showVerifyViaCall = false;

	      element.find("#signInModal").modal('hide');
	      element.find("#signUpModal").modal(options);
	    };

			scope.showModal = (selector) => {
				element.find(selector).modal();
			};

			scope.hideModal = (selector) => {
				element.find(selector).modal('hide');
			};

			scope.hideVerifyViaCall = () => {
				element.find("#verifyViaCall").modal('hide');
			};

			scope.hideVerification = () => {
				element.find("#verification").modal('hide');
			};

			scope.showVerification = (callback) => {
				scope.verificationSuccessCallback = callback;
				element.find("#verification").modal();
			};

			scope.showCreatePassword = () => {
				scope.showModal('#createPassword');
			};

			scope.showForgotPassword = () => {
				scope.showModal('#forgotPassword');
			};

			scope.forgotPassword = () => {
				scope.hideSignin();

				// show Create Password Modal on OTP verification success
				scope.showVerification(scope.showForgotPassword);
				scope.sendOTP();
			};

			scope.showVerificationSuccessful = (heading, subHeading = '') => {
				scope.verificationHeading = heading;
				scope.verificationSubHeading = subHeading;

				element.find("#verificationSuccessful").modal();

				$timeout(() => {
					element.find("#verificationSuccessful").modal('hide');

					window.location.reload();
				}, 2500);
			};

			scope.startTimer = (duration, display, callback) => {
				var timer = duration,
		        minutes,
		        seconds;

		    function _timer() {
		      setTimeout(() => {
		          minutes = parseInt(timer / 60, 10);
		          seconds = parseInt(timer % 60, 10);

		          minutes = minutes < 10 ? "0" + minutes : minutes;
		          seconds = seconds < 10 ? "0" + seconds : seconds;

		          display.textContent = minutes + ":" + seconds;

		          if (--timer < 0) {
		            callback();
		          }
		          else {
		            _timer();
		          }
		      }, 1000);
		    }

		    _timer();
			};
		},
		scope: {},
		bindToController: true
	};
};

loginComponent.$inject = ["$timeout"];

export default loginComponent;
