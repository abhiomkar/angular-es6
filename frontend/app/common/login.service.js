class LoginService {
  constructor($rootScope) {
    this.isLoggedIn = App.isLoggedIn;
    this.$rootScope = $rootScope;

	this.emitShowSignin = () => {
		$rootScope.$broadcast('SHOW_SIGNIN', {});
	};
  }
}

LoginService.$inject = ['$rootScope'];

export default LoginService;
