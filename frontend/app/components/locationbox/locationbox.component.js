import template from './locationbox.html';
import controller from './locationbox.controller';
import './locationbox.css';

let locationboxComponent = function(){
	return {
		template,
		controller,
		restrict: 'E',
		controllerAs: 'vm',
		scope: {},
		bindToController: true,
		link: function(scope, element, attrs) {
		}
	};
};

export default locationboxComponent;
