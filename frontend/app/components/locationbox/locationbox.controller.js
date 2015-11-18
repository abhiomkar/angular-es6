import $ from 'jquery';
import _ from 'lodash';
import angular from 'angular';
import GoogleMaps from 'google-maps';

class LocationboxController {
	constructor($scope, $element, $location, $window, $rootScope, $http, $q, $cookies){
		let canceler = $q.defer();
		let that = this;

		this.name = 'locationbox';

		$scope.activeSuggestionIndex = -1;
		$scope.locateMeText = "Locate me";
		$scope.addressSuggestionList = [];

		$scope.autoSuggestAddress = function() {
			let params = {
				input: $scope.locationInput
			};

			let request = $http.get("/api/place/autocomplete", {
				params,
				timeout: canceler.promise
			});

			if ($scope.locationInput === '') {
				$scope.locationHint = '';
			}

			let re = new RegExp('^' + $scope.locationInput, "i");
			if (!re.test($scope.locationHint)) {
				$scope.locationHint = $scope.locationInput;
			}

			$scope.activeSuggestionIndex = -1;

			let promise = request.then((response) => {
				$scope.addressSuggestionList = response.data.predictions;

				if (response.data.predictions.length > 0) {
					let firstResult = response.data.predictions[0].description;
					let re = new RegExp('^' + $scope.locationInput, "i");

					$scope.showAddressList = true;

					if(re.test(firstResult)) {
							$scope.locationHint = firstResult.replace(re.exec(firstResult)[0], $scope.locationInput);
					}
					else {
						$scope.locationHint = '';
					}
				}
				else {
					$scope.locationHint = '';
					$scope.showAddressList = false;
				}
			},
			(response) => {
				console.log("Error: ", response);
			});

			promise.abort = function() {
				canceler.resolve();
			}
		};

		$scope.handleKeyDown = function(event, updateMap) {
			// Key codes
			// @tab 9
			// @down 40
			// @up 38

			if (event.keyCode === 9) {
				// TAB Key
				event.preventDefault();

				if ($scope.addressSuggestionList.length > 0) {
					let firstResult = $scope.addressSuggestionList[0].description;
					let re = new RegExp('^' + $scope.locationInput, "i");

					if (re.test(firstResult)) {
						$scope.locationInput = firstResult;
						$scope.locationHint = '';
						$scope.place_id = $scope.addressSuggestionList[0].place_id;

						$scope.showAddressList = false;
					}
				}
			}
			else if (event.keyCode === 40) {
				// Down Key
				event.preventDefault();

				if ($scope.activeSuggestionIndex < ($scope.addressSuggestionList.length - 1)) {
					$scope.activeSuggestionIndex++;

					$scope.locationHint = '';
					$scope.locationInput = $scope.addressSuggestionList[$scope.activeSuggestionIndex].description;
					$scope.place_id = $scope.addressSuggestionList[$scope.activeSuggestionIndex].place_id;
				}
			}
			else if (event.keyCode === 38) {
				// Up Key
				event.preventDefault();

				if ($scope.activeSuggestionIndex > 0) {
					$scope.activeSuggestionIndex--;

					$scope.locationHint = '';
					$scope.locationInput = $scope.addressSuggestionList[$scope.activeSuggestionIndex].description;
					$scope.place_id = $scope.addressSuggestionList[$scope.activeSuggestionIndex].place_id;
				}
			}
			else if (event.keyCode === 13) {
				// Enter Key
				if ($scope.addressSuggestionList.length > 0) {
					let firstResult = $scope.addressSuggestionList[0].description;
					let re = new RegExp('^' + $scope.locationInput, "i");

					if (updateMap) {
						if ($scope.activeSuggestionIndex === -1) {
							$scope.activeSuggestionIndex = 0;
						}
						$scope.updateMap($scope.addressSuggestionList[$scope.activeSuggestionIndex]);
					}
					else if (re.test(firstResult) && $scope.activeSuggestionIndex < 0) {
						// when input is incomplete - auto complete it and proceed
						$scope.locationInput = firstResult;
						$scope.locationHint = '';
						$scope.place_id = $scope.addressSuggestionList[0].place_id;

						$scope.showMapModal({placeId: $scope.place_id});
					}
					else {
						// when the user selects the address from address suggestion list and pressed enter
						$scope.showMapModal({placeId: $scope.place_id});
					}

					$scope.showAddressList = false;
				}
			}
		};

		$scope.getLocation = function() {
      if (navigator.geolocation) {
      	if (!$scope.locateMeProgressing) {
					$scope.locateMeText = "Locating...";
					$scope.locateMeProgressing = true;

					navigator.geolocation.getCurrentPosition($scope.setPosition, $scope.showError);
				}
      }
      else {
        $scope.error = "Geolocation is not supported by this browser.";
      }
		};

		$scope.setPosition = function(position) {
			let location = {
				lat: position.coords.latitude,
				lng: position.coords.longitude
			};
			GoogleMaps.load(function(google) {
				let geocoder = new google.maps.Geocoder;

				// reverse geocode
				geocoder.geocode({location}, (results, status) => {
					if (results[0]) {
						$scope.$apply(() => {
							$scope.locationHint = '';
							$scope.locationInput = results[0].formatted_address;
							try {
								$scope.locationArea = _.last(_.filter(address.address_components, function(c) { return c.types[1] === "sublocality"; })).long_name;
							}
							catch (e) {}
							$scope.latLng = location;
							$scope.locateMeText = "Locate me";
							$scope.locateMeProgressing = false;
							$scope.showAddressList = false;
						});
					}
				});
			});
		};

		$scope.showError = function() {
			$scope.locateMeText = "Locate me";
			$scope.locateMeProgressing = false;

			switch (error.code) {
          case error.PERMISSION_DENIED:
              $scope.error = "User denied the request for Geolocation."
              break;
          case error.POSITION_UNAVAILABLE:
              $scope.error = "Location information is unavailable."
              break;
          case error.TIMEOUT:
              $scope.error = "The request to get user location timed out."
              break;
          case error.UNKNOWN_ERROR:
              $scope.error = "An unknown error occurred."
              break;
      }
		};
	}
}

LocationboxController.$inject = ["$scope", "$element", "$location", "$window", "$rootScope", "$http", "$q", "$cookies"];

export default LocationboxController;
