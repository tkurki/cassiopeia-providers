var Transform = require('stream').Transform

var ina219 = require('ina219')
ina219.init()

const coeff = -0.020351086

function I2cProvider () {
  const pushIt = this.push.bind(this)
  ina219.calibrate32V1A(function () {
    setInterval(measure.bind(this, pushIt), 5000)
  })
  Transform.call(this, {
    objectMode: true
  })
}

require('util').inherits(I2cProvider, Transform)

var Ads1x15 = require('node-ads1x15')
var ads1x15 = new Ads1x15(1, 0x48)

function measure (callback) {
  var amps
  ina219
    .getShuntVoltage_raw()
    .then(function (shuntVoltage) {
      amps =
        (shuntVoltage & 0x8000 ? shuntVoltage - 0x10000 : shuntVoltage) * coeff
      return ads1x15.readADCSingleEnded(0, 4096, 250)
    })
    .then(function (measuredVolts) {
      callback({
        updates: [
          {
            source: {},
            values: [
              // {
              //   path: 'electrical.batteries.house.voltage',
              //   value: (measuredVolts / 1000) * 4.11135334
              // },
              {
                path: 'electrical.batteries.house.current',
                value: amps
              }
            ]
          }
        ]
      })
    })
    .then(() => {
      return new Promise((resolve, reject) => {
        bmp180.read(data => {
          callback({
            updates: [
              {
                values: [
                  {
                    path: 'environment.outside.pressure',
                    value: data.pressure
                  }
                ]
              }
            ]
          })
        })
        resolve()
      })
    })
}

const i2cbmp180 = require('node-red-contrib-bmp180/resources/i2cbmp180')
const bmp180 = new i2cbmp180({})

I2cProvider.prototype._transform = function (chunk, encoding, done) {
  console.error("Not a real transformer, this shouldn't be happening")
}

module.exports = I2cProvider
