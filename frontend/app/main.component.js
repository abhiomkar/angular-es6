import template from './main.html';
import './main.css';

let appComponent = ()=>{
	return {
		template, // because we have a variable name template we can use the shorcut here
		restrict: 'E'
	};
};

export default appComponent;
