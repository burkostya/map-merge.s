var expect = require('chai').expect;
var numbers = require('stream-spectrum/readable/number');

var merge = require('../lib/map-merge.s');

describe('map-merge.s', function () {
  it('should merge stream with map function', function (done) {
    var results = [];
    var sum = merge(function (first, second, done) {
      done(null, first + second);
    });
    var oneToFive = numbers({ from: 1, to: 5  });
    var sixToTen  = numbers({ from: 6, to: 10 });
    sum.on('readable', function () {
      var item;
      while ((item = sum.read()) !== null) {
        results.push(item);
      }
    });
    sum.on('end', function () {
      expect(results).to.have.length(5);
      expect(results[0]).to.equal(7);
      expect(results[1]).to.equal(9);
      expect(results[2]).to.equal(11);
      expect(results[3]).to.equal(13);
      expect(results[4]).to.equal(15);
      done();
    });
    oneToFive.pipe(sum);
    sixToTen.pipe(sum);
  });
  it('should drop packets from longer stream by default', function (done) {
    var results = [];
    var sum = merge(function (first, second, done) {
      done(null, first + second);
    });
    var oneToFive = numbers({ from: 1, to: 5  });
    var sixToTen  = numbers({ from: 6, to: 8 });
    sum.on('readable', function () {
      var item;
      while ((item = sum.read()) !== null) {
        results.push(item);
      }
    });
    sum.on('end', function () {
      expect(results).to.have.length(3);
      expect(results[0]).to.equal(7);
      expect(results[1]).to.equal(9);
      expect(results[2]).to.equal(11);
      done();
    });
    oneToFive.pipe(sum);
    sixToTen.pipe(sum);
  });
  it('should not drop packets from longer stream with if option present', function (done) {
    var results = [];
    var sum = merge({ dropTail: false }, function (first, second, done) {
      done(null, first + second);
    });
    var oneToFive = numbers({ from: 1, to: 5  });
    var sixToTen  = numbers({ from: 6, to: 8 });
    sum.on('readable', function () {
      var item;
      while ((item = sum.read()) !== null) {
        results.push(item);
      }
    });
    sum.on('end', function () {
      expect(results).to.have.length(5);
      expect(results[0]).to.equal(7);
      expect(results[1]).to.equal(9);
      expect(results[2]).to.equal(11);
      expect(results[3]).to.equal(9);
      expect(results[4]).to.equal(10);
      done();
    });
    oneToFive.pipe(sum);
    sixToTen.pipe(sum);
  });
});
