var Transform = require('readable-stream').Transform;
var inherits  = require('util').inherits;

var Stream = function (options) {
  Transform.call(this, { objectMode: true });
  this._options = options;
};

inherits(Stream, Transform);

Stream.prototype._transform = function(obj, _, done) {
  this.push(obj);
  done();
};

module.exports = function (options) {
  return new Stream(options);
};
