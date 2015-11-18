import cfg from '../config/site-config';
import request from 'request';
import URL from 'url-parse';
import crypto from 'crypto';
import URLSafeBase64 from 'urlsafe-base64';
import _ from 'lodash';

let GooglePlace = {};
let api_key = 'AIzaSyDXV-Ok4azfGvTlW79pANsvmL3--5EVpR0';
// Replace with your secret key & client id here
let secret = '*****';
let client_id = '*****';

GooglePlace.api = function(req, res) {
  let api_request_url;
  let originalUrl = req.originalUrl;

  originalUrl = originalUrl.replace('/maps/api/', '');
  api_request_url = 'https://maps.googleapis.com/maps/api/' + originalUrl;
  api_request_url += '&key=' + api_key;

  request.get(api_request_url, function(error, response, body) {
    if (error) {
      res.json(200, error);
    }
    else {
      let data = JSON.parse(body);
      res.json(200, data);
    }
    return;
  });
};

GooglePlace.autocomplete = function(req, res) {
  let input = req.query.input;
  let path = URL(req.headers.referer).pathname;
  let currentCity, cityName, location, filterStr;
  let api_request_url = 'https://maps.googleapis.com/maps/api/place/autocomplete/json?input=' + input + '&key=' + api_key;

  request.get(api_request_url, function(error, response, body) {
    if (error) {
      res.json(200, error);
    }
    else {
      let data = JSON.parse(body);
      res.json(200, data);
    }
    return;
  });
};

// /api/place/staticmap?url=https%3A%2F%2Fmaps.googleapis.com%2Fmaps%2Fapi%2Fstaticmap%3Fzoom%3D15%26size%3D300x200%26maptype%3Droadmap%26markers%3D12.927923%2C77.627108
GooglePlace.signurl = function(req, res) {
  let input_url = req.query.url;

  input_url += '&client=' + client_id;

  let url = URL(input_url);


  let url_to_sign = url.pathname + url.query;
  let decoded_key = URLSafeBase64.decode(secret);

  let signature = crypto.createHmac('sha1', decoded_key).update(url_to_sign).digest('base64');
  signature = signature.replace(/\+/g, '-').replace(/\//g, '_');
  let encoded_signature = URLSafeBase64.encode(signature);

  let original_url = url.protocol + '//' + url.host + url.pathname + url.query;

  return res.redirect(original_url + '&signature=' + encoded_signature);
};

export default GooglePlace;
