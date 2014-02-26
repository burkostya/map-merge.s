var merge   = require('../lib/map-merge.s.js');
var numbers = require('stream-spectrum/readable/number');
var inspect = require('inspect-stream');

var sum   = merge(function (first, second, done) {
  done(null, first + second);
});

var power = merge(function (first, second, done) {
  done(null, Math.pow(first, second));
});

numbers({ from: 1, to: 8, objectMode: true }).pipe(sum);
numbers({ from: 2, to: 9, objectMode: true }).pipe(sum);
sum.pipe(inspect()); // Outputs 3, 5, 7, 9, 11, 13, 15, 17

numbers({ from: 1, to: 4, objectMode: true }).pipe(power);
numbers({ from: 1, to: 3, objectMode: true }).pipe(power);
power.pipe(inspect()); // Outputs 1, 4, 27. Last packet (4^?) was droped
