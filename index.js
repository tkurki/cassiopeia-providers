var Transform = require('stream').Transform;

function I2cProvider() {
  setInterval(measure.bind(this, this.push.bind(this)), 5000);
  Transform.call(this, {
    objectMode: true
  });
}

require('util').inherits(I2cProvider, Transform);

var Ads1x15 = require('node-ads1x15');
var ads1x15 = new Ads1x15(1, 0x48);

function measure(callback) {
  var ampV = 0;
  ads1x15.readADCDifferential23(256, 32).then(function(d) {
    amps = d * 1.894259348;
    return ads1x15.readADCSingleEnded(0, 4096, 250);
  }).then(function(d) {
    callback({
      updates: [{
        "source": {
        },
        values: [{
        path: "electrical.batteries.house.voltage",
        value: (d / 1000 * 4.11135334)
      }, {
        path: "electrical.batteries.house.current",
        value: amps
      }]}]
    });
  });
}



I2cProvider.prototype._transform = function(chunk, encoding, done) {
  console.error("Not a real transformer, this shouldn't be happening");
};


module.exports = I2cProvider;
