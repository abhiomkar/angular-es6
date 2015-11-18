import _ from 'lodash';

export default class Cities {
  constructor() {
    this.cities = App.cityList;
  }

  list() {
    return this.cities;
  }

  getCityFromSlug(slug) {
  	slug = _.trimRight(slug, ['/']);
  	return _.first(_.filter(this.cities, (city) => city.slug === slug));
  }
}
