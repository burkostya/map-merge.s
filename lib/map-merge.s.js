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

  self._sources = [];
  self._buffer = [null, null];
  self._first  = new Transform({ objectMode: true });
  self._second = new Transform({ objectMode: true });
  self._first._transform = function (packet, _, done) {
    if (self._secondFlushed) {
      return done();
    }
    self._buffer[0] = packet;
    if (self._buffer[1] !== null) {
      self._map(self._buffer[0], self._buffer[1], function (err, result) {
        if (err) { return self.done(err); }
        self.write(result);
        var cb = self._secondDone;
        self._secondDone = null;
        done();
        cb();
      });
      self._buffer[0] = null;
      self._buffer[1] = null;
    } else {
      self._firstDone = done;
    }
  };
  self._second._transform = function (packet, _, done) {
    if (self._firstFlushed) {
      return done();
    }
    self._buffer[1] = packet;
    if (self._buffer[0] !== null) {
      self._map(self._buffer[0], self._buffer[1], function (err, result) {
        if (err) { return self.done(err); }
        self.write(result);
        var cb = self._firstDone;
        self._firstDone = null;
        done();
        cb();
      });
      self._buffer[0] = null;
      self._buffer[1] = null;
    } else {
      self._secondDone = done;
    }
  };
  self._first._flush = function (done) {
    if (self._secondFlushed) {
      self.end();
    } else {
      self._firstFlushed = true;
    }
    done();
  };
  self._second._flush = function (done) {
    if (self._firstFlushed) {
      self.end();
    } else {
      self._secondFlushed = true;
    }
    done();
  };

  self._first.on('error', function (err) { self._error = err; });
  self._second.on('error', function (err) { self._error = err; });

  self.on('pipe', function (src) {
    src.unpipe(self);
    if (self._sources.length === 0) {
      src.pipe(self._first);
    } else {
      src.pipe(self._second);
    }
    self._sources.push(src);
  });
};

inherits(Stream, Transform);

Stream.prototype._transform = function(obj, _, done) {
  if (this._error) { return done(this._error); }
  this.push(obj);
  done();
};

module.exports = function (options, map) {
  return new Stream(options, map);
};
