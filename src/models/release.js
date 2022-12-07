/*
      .                              .o8                     oooo
   .o8                             "888                     `888
 .o888oo oooo d8b oooo  oooo   .oooo888   .ooooo.   .oooo.o  888  oooo
   888   `888""8P `888  `888  d88' `888  d88' `88b d88(  "8  888 .8P'
   888    888      888   888  888   888  888ooo888 `"Y88b.   888888.
   888 .  888      888   888  888   888  888    .o o.  )88b  888 `88b.
   "888" d888b     `V88V"V8P' `Y8bod88P" `Y8bod8P' 8""888P' o888o o888o
 ========================================================================
 */

var mongoose = require('mongoose')
var utils = require('../helpers/utils')

var COLLECTION = 'release'

/**
 * @since 1.0
 * @author Chris Brame <polonel@gmail.com>
 * @copyright 2015 Chris Brame
 **/

/**
 * Release Object Schema for MongoDB
 * @module models/release
 * @class Notice
 * @property {String} name ```Required``` Name of the notice
 * @property {Date} date ```Required``` __[default:Date.now]__ Date the notice was created
 * @property {String} color ```Required``` __[default:#e74c3c]__ Color to display the notice in
 * @property {String} message ```Required``` Message of the Notice
 * @property {Boolean} active ```Required``` __[default: false]__ Is the Notice Active?
 */
var releaseSchema = mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, default: Date.now, required: true },
  color: { type: String, default: '#e74c3c', required: true },
  fontColor: { type: String, default: '#ffffff', required: true },
  message: { type: String, required: true },
  active: { type: Boolean, default: false, required: true },
  activeDate: { type: Date, default: Date.now },
  alertWindow: { type: Boolean, default: false }
})

releaseSchema.pre('save', function (next) {
  this.name = utils.sanitizeFieldPlainText(this.name.trim())
  this.message = utils.sanitizeFieldPlainText(this.message.trim())

  return next()
})

releaseSchema.statics.getReleases = function (callback) {
  return this.model(COLLECTION)
    .find({})
    .exec(callback)
}

releaseSchema.statics.getRelease = function (id, callback) {
  return this.model(COLLECTION)
    .findOne({ _id: id })
    .exec(callback)
}

releaseSchema.statics.getReleaseByName = function (name, callback) {
  return this.model(COLLECTION)
    .find({ name: name })
    .exec(callback)
}

releaseSchema.statics.getActive = function (callback) {
  return this.model(COLLECTION)
    .findOne({ active: true })
    .exec(callback)
}

module.exports = mongoose.model(COLLECTION, releaseSchema)
