import $ from 'jquery';
import angular from 'angular';
import uiRouter from 'angular-ui-router';
import locationboxComponent from './locationbox.component';

let locationboxModule = angular.module('locationbox', [
	uiRouter
])
.directive('locationbox', locationboxComponent)
.config(['$locationProvider', function($locationProvider) {
  $locationProvider.html5Mode(true);
}])
.filter('unique', function() {
  return function (arr, field) {
      return _.uniq(arr, function(a) { return a[field]; });
  };
})
.filter('boldMatchedText', function() {
	return function(text, substring) {
		// @text = Koramangala 1st Block, HSR Layout 5th Sector, Bengaluru, Karnataka, India
		// @substring = korama
		// @return '<b>Korama</b>ngala 1st Block, HSR Layout 5th Sector, Bengaluru, Karnataka, India'

		let re = RegExp('^' + substring, 'i');

		let match = re.exec(text);

		if (match && match.length && match[0].length !== text.length) {
			return '<b>' + match[0] + '</b>' + text.slice(match[0].length);
		}
		else {
			return text;
		}
	}
})
.filter('to_trusted', ['$sce', function($sce){
  return function(text) {
      return $sce.trustAsHtml(text);
  };
}]);

export default locationboxModule;
