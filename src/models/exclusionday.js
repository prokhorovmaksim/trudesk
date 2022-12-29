
const mongoose = require('mongoose')
const _ = require('lodash')

const COLLECTION = 'exclusion_days'

const exclusionDaySchema = mongoose.Schema({
  name: { type: String, required: true },
  deleted: { type: Boolean, default: false, required: true },
  days: [{
    date: { type: Date, required: true },
    isEnabled: { type: Boolean, default: false }
  }],
})

exclusionDaySchema.statics.getExclusionDaysByName = function (name, callback) {
  if (_.isUndefined(name) || name.length < 1) return callback('Invalid Exclusion Days Directory Name -' +
    ' ExclusionDaySchema.getExclusionDaysByName()')

  var q = this.model(COLLECTION)
    .findOne({ name: name })

  return q.exec(callback)
}

exclusionDaySchema.statics.getExclusionDaysDirectories = function (callback) {
  return this.model(COLLECTION)
    .find({ deleted: false })
    .sort('name')
    .exec(callback)
}

exclusionDaySchema.statics.softDelete = function (oId, callback) {
  if (_.isUndefined(oId)) return callback('Invalid ObjectID - ExclusionDaySchema.SoftDelete()', null)

  const self = this

  return self.model(COLLECTION).findOneAndUpdate({ _id: oId }, { deleted: true }, { new: true }, callback)
}

module.exports = mongoose.model(COLLECTION, exclusionDaySchema)