import angular from 'angular';
import Locationbox from './locationbox/locationbox';
// import Login from './login/login';

let componentModule = angular.module('app.components', [
	Locationbox.name
	// Login.name
]);

export default componentModule;
