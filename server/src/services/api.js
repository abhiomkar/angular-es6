import _ from 'lodash';
import request from 'request';

import cfg from '../config/site-config';

let Api = (function() {
  let _module = {};

  let isJSON = function(str) {
    console.log(str);

    try {
      JSON.parse(str);
    }
    catch (e) {
      console.log('JSON.parse failed!');
      return false;
    }
    return true;
  };

  _module.proxy = function(req, res) {
    let options = {};
    let scheme = cfg.https_enabled ? 'https://' : 'http://';
    let api_req_url = scheme + cfg.api_host + req.url;

    options = {
      url: api_req_url,
      headers: {
        "content-type": "application/json",
      },
      json: true,
      method: req.method
    };

    if (req.method === "POST" || req.method === "PUT" || req.method === "DELETE") {
      options = _.extend(options, {body: req.body});
    }

    let r = request(options, function(error, response, body) {
      let errorResponse = {};
      if (body.statusCode === 0) {
        return res.json(200, body);
      }
      else {
        if (typeof body === 'object') {
          errorResponse = _.extend({error: true}, body);
        }
        else {
          errorResponse = {error: true, statusMessage: JSON.stringify(body)};
        }
        return res.json(200, errorResponse);
      }
    });
  };
  return _module;
})();

export default Api;
