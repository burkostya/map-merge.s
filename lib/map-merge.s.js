var Transform = require('readable-stream').Transform;
var inherits  = require('util').inherits;

var Stream = function (options, map) {
  var self = this;
  Transform.call(self, { objectMode: true });
  if (typeof options === 'function') {
    map     = options;
    options = {};
  }
  self._map     = map;
  self._options = options;

  self._buffer = [null, null];
  self._first  = new Transform({ objectMode: true });
  self._second = new Transform({ objectMode: true });
  self._first._transform = function (packet, _, done) {
    self._buffer[0] = packet;
    if (self._buffer[1] !== null) {
      self.map(self._buffer[0], self._buffer[1], function (err, result) {
        if (err) { return self.done(err); }
        self.push(result);
        done();
        var cb = self._restDone;
        self._restDone = null;
        cb();
      });
      self._buffer[0] = null;
      self._buffer[1] = null;
    } else {
      self._restDone = done;
    }
  };
  self._second._transform = function (packet, _, done) {
    self._buffer[1] = packet;
    if (self._buffer[0] !== null) {
      self.map(self._buffer[0], self._buffer[1], function (err, result) {
        if (err) { return self.done(err); }
        self.push(result);
        done();
        var cb = self._restDone;
        self._restDone = null;
        cb();
      });
      self._buffer[0] = null;
      self._buffer[1] = null;
    } else {
      self._restDone = done;
    }
  };

  self.on('pipe', function (src) {
    src.unpipe(self);
    if (!self._firstSource) {
      src.pipe(self._first);
    } else {
      src.pipe(self._second);
    }
  });
};

inherits(Stream, Transform);

Stream.prototype._transform = function(obj, _, done) {
  this.push(obj);
  done();
};


module.exports = function (options, map) {
  return new Stream(options, map);
};
