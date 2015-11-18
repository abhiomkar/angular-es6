import express from 'express';
import path from 'path';

import config_globals from './config/site-config';
import HomeController from './controllers/home';

let router = express.Router();

router.all("/", HomeController.index);

import GooglePlace from './services/google-place';
router.get("/maps/api/*", GooglePlace.api);
router.get("/api/place/autocomplete", GooglePlace.autocomplete);
router.get("/api/place/staticmap", GooglePlace.signurl);

import api from './services/api';
router.get("/api/*", api.proxy);
router.post("/api/*", api.proxy);
router.delete("/api/*", api.proxy);
router.put("/api/*", api.proxy);

export default router;
