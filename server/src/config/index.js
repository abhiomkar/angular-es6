let normalizePort;

let Module = {};

Module.setEnv = function(environment) {
  /*
    Common config
   */
  Module.HOSTNAME = "0.0.0.0";
  Module.PORT = normalizePort(process.env.PORT || "5000");
  Module.PUBLIC_PATH = "public";
  Module.VIEWS_ENGINE = "html";
  // Module.VIEWS_PATH = "server/views";
  Module.IMAGES_PATH = "images";

  /*
    Environment specific config
   */
  switch (environment) {
    case "development":
      return null;
    case "testing":
      return null;
    case "production":
      return null;
    default:
      return console.log("Unknown environment " + environment + "!");
  }
};


/**
 * Normalize a port into a number, string, or false.
 */

normalizePort = function(val) {
  let port;
  port = parseInt(val, 10);
  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};

export default Module;
