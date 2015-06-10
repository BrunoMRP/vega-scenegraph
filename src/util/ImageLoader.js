var dl = require('datalib');

function ImageLoader(loadConfig) {
  this._pending = 0;
  this._config = loadConfig || ImageLoader.Config; 
}

// Overridable global default load configuration
ImageLoader.Config = null;

var prototype = ImageLoader.prototype;

prototype.pending = function() {
  return this._pending;
};

prototype.params = function(uri) {
  return dl.extend({url: uri}, this._config);
};

prototype.imageURL = function(uri) {
  return dl.load.sanitizeUrl(this.params(uri));
};

function browser(uri, callback) {
  var url = dl.load.sanitizeUrl(this.params(uri));
  if (!url) { // error
    if (callback) callback(uri, null);
    return null;
  }
  
  var loader = this,
      image = new Image();

  loader._pending += 1;

  image.onload = function() {
    loader._pending -= 1;
    image.loaded = true;
    if (callback) callback(null, image);
  };
  image.src = url;

  return image;
}

function server(uri, callback) {
  var loader = this,
      image = new (require('canvas').Image)();

  loader._pending += 1;

  dl.load(this.params(uri), function(err, data) {
    loader._pending -= 1;
    if (err) {
      if (callback) callback(err, null);
      return null;
    }
    image.src = data;
    image.loaded = true;
    if (callback) callback(null, image);
  });

  return image;
}

prototype.loadImage = function(uri, callback) {
  return dl.isNode ?
    server.call(this, uri, callback) :
    browser.call(this, uri, callback);
};

module.exports = ImageLoader;
