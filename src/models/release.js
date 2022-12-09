
const async = require('async')
const mongoose = require('mongoose')
const winston = require('../logger')
const _ = require('lodash')
const moment = require('moment')
const sanitizeHtml = require('sanitize-html')
const xss = require('xss')
const utils = require('../helpers/utils')

// Needed - For Population
const groupSchema = require('./group')
require('./ticket')

const COLLECTION = 'releases'

/**
 * Release Schema
 * @module models/release
 * @class Release
 * @requires {@link Group}
 *
 * @property {object} _id ```Required``` ```unique``` MongoDB Object ID
 * @property {Number} uid ```Required``` ```unique``` Readable Release ID
 * @property {Group} group ```Required``` Group this Release is under.
 * @property {Date} date ```Required``` [default: Date.now] Date Release should be completed.
 * @property {Date} updated Date release was last updated
 * @property {Boolean} deleted ```Required``` [default: false] If they release is flagged as deleted.
 * @property {Number} status ```Required``` [default: 0] Release Status. (See {@link Release#setStatus})
 * @property {String} name ```Required``` The title of the release. (Overview)
 * @property {Array} tickets An array of tickets _ids that included in current release.
 */
const releaseSchema = mongoose.Schema({
  // uid: { type: Number, unique: true, index: true },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'groups'
  },
  date: { type: Date, default: Date.now, required: true, index: true },
  updated: { type: Date },
  deleted: { type: Boolean, default: false, required: true, index: true },
  name: { type: String, required: true },
  status: { type: Number, default: 0, required: true, index: true },
  tickets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'tickets' }]
})

releaseSchema.index({ deleted: -1, group: 1, status: 1 })

const autoPopulate = function (next) {

  return next()
}

releaseSchema.pre('findOne', autoPopulate).pre('find', autoPopulate)

// releaseSchema.pre('save', function (next) {
//   // this.wasNew = this.isNew
//   //
//   // if (!_.isUndefined(this.uid) || this.uid) {
//   //   return next()
//   // }
//   //
//   // const c = require('./counters')
//   // const self = this
//   // c.increment('releases', function (err, res) {
//   //   if (err) return next(err)
//   //
//   //   self.uid = res.value.next
//   //
//   //   if (_.isUndefined(self.uid)) {
//   //     const error = new Error('Invalid UID.')
//   //     return next(error)
//   //   }
//   //
//   //   return next()
//   // })
//   return next()
// })

// releaseSchema.post('save', async function (doc, next) {
//   if (!this.wasNew) {
//     const emitter = require('../emitter')
//     try {
//       const savedRelease = await doc.populate([
//         {
//           path: 'group',
//           model: groupSchema,
//           populate: [
//             {
//               path: 'members',
//               model: userSchema,
//               select: '-__v -accessToken -tOTPKey'
//             },
//             {
//               path: 'sendMailTo',
//               model: userSchema,
//               select: '-__v -accessToken -tOTPKey'
//             }
//           ]
//         }
//       ])
//
//       emitter.emit('release:updated', savedRelease)
//     } catch (err) {
//       winston.warn('WARNING: ' + err)
//     }
//
//     return next()
//   } else {
//     return next()
//   }
// })

releaseSchema.virtual('statusFormatted').get(function () {
  const s = this.status
  let formatted
  switch (s) {
    case 0:
      formatted = 'Pending'
      break
    case 1:
      formatted = 'Overdue'
      break
    case 2:
      formatted = 'Closed'
      break
    default:
      formatted = 'Pending'
  }

  return formatted
})


/**
 * Set Status on Instanced Release
 * @instance
 * @method setStatus
 * @memberof Release
 *
 * @param {Object} ownerId Account ID preforming this action
 * @param {Number} status Status to set
 * @param {function} callback Callback with the updated release.
 *
 * @example
 * Status:
 *      0 - Pending
 *      1 - Overdue
 *      2 - Closed
 */
releaseSchema.methods.setStatus = function (ownerId, status, callback) {
  const self = this
  return new Promise((resolve, reject) => {
    if (_.isUndefined(status)) {
      if (typeof callback === 'function') callback('Invalid Status', null)
      return reject(new Error('Invalid Status'))
    }

    self.update = status === 3 ? new Date() : null
    self.status = status

    if (typeof callback === 'function') callback(null, self)

    return resolve(self)
  })
}




/**
 * Sets this release under the given group Id
 * @instance
 * @method setReleaseGroup
 * @memberof Release
 *
 * @param {Object} ownerId Account ID preforming this action
 * @param {Object} groupId MongoDB group Id to assign this release to
 * @param {function} callback Callback with the updated release.
 */
releaseSchema.methods.setReleaseGroup = function (ownerId, groupId, callback) {
  const self = this
  self.group = groupId

  self.populate('group', function (err, release) {
    if (err) return callback(err)
    return callback(null, release)
  })
}


releaseSchema.methods.setName = function (ownerId, name, callback) {
  const self = this
  return new Promise(resolve => {
    self.name = name

    if (typeof callback === 'function') callback(null, self)

    return resolve(self)
  })
}

releaseSchema.methods.addTicket = function (ticketId, callback) {
  const self = this

  const hasSub = _.some(self.subscribers, function (i) {
    return i._id.toString() === ticketId.toString()
  })

  if (!hasSub) {
    self.tickets.push(ticketId)
  }

  return callback(null, self)
}

releaseSchema.methods.removeTicket = function (ticketId, callback) {
  const self = this

  const ticket = _.find(self.tickets, function (i) {
    return i._id.toString() === ticketId.toString()
  })

  if (_.isUndefined(ticket) || _.isEmpty(ticket) || _.isNull(ticket)) return callback(null, self)

  self.tickets = _.reject(self.tickets, function (i) {
    return i._id.toString() === ticketId.toString()
  })

  return callback(null, self)
}

/**
 * Gets all Releases that are not marked as deleted <br> <br>
 *
 * **Deep populates: group, group.members, group.sendMailTo, comments, comments.owner**
 *
 * @memberof Release
 * @static
 * @method getAll
 * @param {function} callback MongoDB Query Callback
 *
 * @example
 * releaseSchema.getAll(function(err, releases) {
 *    if (err) throw err;
 *
 *    //releases is an array
 * });
 */
releaseSchema.statics.getAll = function (callback) {
  const self = this
  const q = self
    .model(COLLECTION)
    .find({ deleted: false })
    .populate('tickets')
    .populate('group')
    .sort({ status: 1 })
    .lean()

  return q.exec(callback)
}

releaseSchema.statics.getForCache = function (callback) {
  const self = this
  return new Promise((resolve, reject) => {
    ;(async () => {
      try {
        const t365 = moment
          .utc()
          .hour(23)
          .minute(59)
          .second(50)
          .subtract(365, 'd')
          .toDate()

        const query = self
          .model(COLLECTION)
          .find({ date: { $gte: t365 }, deleted: false })
          .sort('date')
          .lean()

        if (typeof callback === 'function') return query.exec(callback)

        const results = await query.exec()

        return resolve(results)
      } catch (err) {
        if (typeof callback === 'function') return callback(err)

        return reject(err)
      }
    })()
  })
}

releaseSchema.statics.getAllNoPopulate = function (callback) {
  const self = this
  const q = self
    .model(COLLECTION)
    .find({ deleted: false })
    .sort({ status: 1 })
    .lean()

  return q.exec(callback)
}

releaseSchema.statics.getAllByStatus = function (status, callback) {
  const self = this

  if (!_.isArray(status)) {
    status = [status]
  }

  const q = self
    .model(COLLECTION)
    .find({ status: { $in: status }, deleted: false })
    .populate('tickets')
    .populate('group')
    .sort({ status: 1 })
    .lean()

  return q.exec(callback)
}

/**
 * Gets Releases with a given group id.
 *
 * @memberof Release
 * @static
 * @method getReleases
 * @param {Array} grpIds Group Id to retrieve releases for.
 * @param {function} callback MongoDB Query Callback
 */
releaseSchema.statics.getReleases = function (grpIds, callback) {
  if (_.isUndefined(grpIds)) {
    return callback('Invalid GroupId - ReleaseSchema.GetReleases()', null)
  }

  if (!_.isArray(grpIds)) {
    return callback('Invalid GroupId (Must be of type Array) - ReleaseSchema.GetReleases()', null)
  }

  const self = this

  const q = self
    .model(COLLECTION)
    .find({ group: { $in: grpIds }, deleted: false })
    .populate('tickets')
    .populate('group')
    .sort({ status: 1 })

  return q.exec(callback)
}

/**
 * Gets Releases with a given departments and a JSON Object <br/><br/>
 * *Sorts on UID desc.*
 * @memberof Release
 * @static
 * @method getReleasesByDepartments
 *
 * @param {Object} departments Departments to retrieve releases for.
 * @param {Object} object JSON Object with query options
 * @param {function} callback MongoDB Query Callback
 *
 * @example
 * //Object Options
 * {
 *    limit: 10,
 *    page: 0,
 *    closed: false,
 *    status: 1
 * }
 */
releaseSchema.statics.getReleasesByDepartments = function (departments, object, callback) {
  if (!departments || !_.isObject(departments) || !object)
    return callback('Invalid Data - ReleaseSchema.GetReleasesByDepartments()')

  const self = this

  if (_.some(departments, { allGroups: true })) {
    groupSchema.find({}, function (err, groups) {
      if (err) return callback({ error: err })
      return self.getReleasesWithObject(groups, object, callback)
    })
  } else {
    const groups = _.flattenDeep(
      departments.map(function (d) {
        return d.groups.map(function (g) {
          return g._id
        })
      })
    )

    return self.getReleasesWithObject(groups, object, callback)
  }
}

function buildQueryWithObject (SELF, grpId, object, count) {
  const limit = object.limit || 10
  const page = object.page || 0
  let _status = object.status

  // Check up on status formatting
  if (_.isArray(_status)) {
    // This is a hack - querystring adds status in the array as [ "1,2,3" ]
    // This will convert the array to [ "1", "2", "3" ]
    _status = _.join(_status, ',').split(',')
  }

  if (object.filter && object.filter.groups)
    grpId = _.intersection(
      object.filter.groups,
      _.map(grpId, g => g._id.toString())
    )

  let query
  if (count) query = SELF.model(COLLECTION).countDocuments({ groups: { $in: grpId }, deleted: false })
  else {
    query = SELF.model(COLLECTION)
      .find({ group: { $in: grpId }, deleted: false })
      .populate('tickets')
      .populate('group')
      .sort({ uid: -1 })
  }

  // Query with Limit?
  if (limit !== -1) query.skip(page * limit).limit(limit)
  // Status Query
  if (_.isArray(_status) && _status.length > 0) {
    query.where({ status: { $in: _status } })
  }

  // Filter Query
  if (object.filter) {
    // Filter on UID
    if (object.filter.uid) {
      object.filter.uid = parseInt(object.filter.uid)
      if (!_.isNaN(object.filter.uid)) query.or([{ uid: object.filter.uid }])
    }

    // Name Filter
    if (object.filter.name) query.or([{ subject: new RegExp(object.filter.name, 'i') }])

    // Date Filter
    if (object.filter.date) {
      let startDate = new Date(2000, 0, 1, 0, 0, 1)
      let endDate = new Date()
      if (object.filter.date.start) startDate = new Date(object.filter.date.start)
      if (object.filter.date.end) endDate = new Date(object.filter.date.end)

      query.where({ date: { $gte: startDate, $lte: endDate } })
    }
  }

  return query
}

releaseSchema.statics.getReleasesWithObject = async function (grpId, object, callback) {
  const self = this
  return new Promise((resolve, reject) => {
    ;(async () => {
      try {
        if (!grpId || !_.isArray(grpId) || !_.isObject(object))
          throw new Error('Invalid parameter in - ReleaseSchema.GetReleasesWithObject()')

        const query = buildQueryWithObject(self, grpId, object)

        if (typeof callback === 'function') return query.exec(callback)

        const resReleases = await query.exec()

        return resolve(resReleases)
      } catch (e) {
        if (typeof callback === 'function') return callback(e)

        return reject(e)
      }
    })()
  })
}

releaseSchema.statics.getCountWithObject = async function (grpId, object, callback) {
  const self = this
  return new Promise((resolve, reject) => {
    ;(async () => {
      try {
        if (!grpId || !_.isArray(grpId) || !_.isObject(object))
          throw new Error('Invalid parameter in - ReleaseSchema.GetCountWithObject()')

        const query = buildQueryWithObject(self, grpId, object, true)

        if (typeof callback === 'function') return query.lean().exec(callback)

        const count = await query.lean().exec()

        return resolve(count)
      } catch (e) {
        if (typeof callback === 'function') return callback(e)

        return reject(e)
      }
    })()
  })
}

/**
 * Gets Releases for status in given group. <br/><br/>
 * *Sorts on UID desc*
 * @memberof Release
 * @static
 * @method getReleasesByStatus
 *
 * @param {Object} grpId Group Id to retrieve releases for.
 * @param {Number} status Status number to check
 * @param {function} callback MongoDB Query Callback
 */
releaseSchema.statics.getReleasesByStatus = function (grpId, status, callback) {
  if (_.isUndefined(grpId)) {
    return callback('Invalid GroupId - ReleaseSchema.GetReleasesByStatus()', null)
  }

  if (!_.isArray(grpId)) {
    return callback('Invalid GroupId (Must be of type Array) - ReleaseSchema.GetReleasesByStatus()', null)
  }

  const self = this

  const q = self
    .model(COLLECTION)
    .find({ group: { $in: grpId }, status, deleted: false })
    .populate('tickets')
    .populate('group')
    .sort({ uid: -1 })

  return q.exec(callback)
}

/**
 * Gets Single Release with given UID.
 * @memberof Release
 * @static
 * @method getReleaseByUid
 *
 * @param {Number} uid Unique Id for release.
 * @param {function} callback MongoDB Query Callback
 */
releaseSchema.statics.getReleaseByUid = function (uid, callback) {
  if (_.isUndefined(uid)) return callback('Invalid Uid - ReleaseSchema.GetReleaseByUid()', null)

  const self = this

  const q = self
    .model(COLLECTION)
    .findOne({ uid, deleted: false })
    .populate('tickets')
    .populate('group')

  return q.exec(callback)
}

/**
 * Gets Single Release with given object _id.
 * @memberof Release
 * @static
 * @method getReleaseById
 *
 * @param {Object} id MongoDb _id.
 * @param {function} callback MongoDB Query Callback
 */
releaseSchema.statics.getReleaseById = async function (id, callback) {
  const self = this

  return new Promise((resolve, reject) => {
    ;(async () => {
      if (_.isUndefined(id)) {
        const error = new Error('Invalid Id - ReleaseSchema.GetReleaseById()')

        if (typeof callback === 'function') return callback(error, null)

        return reject(error)
      }

      const q = self
        .model(COLLECTION)
        .findOne({ _id: id, deleted: false })
        .populate('tickets')
        .populate({
          path: 'group',
          model: groupSchema,
          populate: [
            {
              path: 'members',
              model: userSchema,
              select: '-__v -iOSDeviceTokens -accessToken -tOTPKey'
            },
            {
              path: 'sendMailTo',
              model: userSchema,
              select: '-__v -iOSDeviceTokens -accessToken -tOTPKey'
            }
          ]
        })

      try {
        const result = await q.exec(callback)

        return resolve(result)
      } catch (e) {
        if (typeof callback === 'function') callback(e)

        return reject(e)
      }
    })()
  })
}


releaseSchema.statics.getReleasesWithSearchString = function (grps, search, callback) {
  if (_.isUndefined(grps) || _.isUndefined(search))
    return callback('Invalid Post Data - ReleaseSchema.GetReleasesWithSearchString()', null)

  const self = this

  const releases = []

  async.parallel(
    [
      function (callback) {
        const q = self
          .model(COLLECTION)
          .find({
            group: { $in: grps },
            deleted: false,
            $where: '/^' + search + '.*/.test(this.uid)'
          })
          .populate('tickets')
          .populate('group')
          .limit(100)

        q.exec(function (err, results) {
          if (err) return callback(err)
          releases.push(results)

          return callback(null)
        })
      },
      function (callback) {
        const q = self
          .model(COLLECTION)
          .find({
            group: { $in: grps },
            deleted: false,
            name: { $regex: search, $options: 'i' }
          })
          .populate('tickets')
          .populate('group')
          .limit(100)

        q.exec(function (err, results) {
          if (err) return callback(err)
          releases.push(results)

          return callback(null)
        })
      }
    ],
    function (err) {
      if (err) return callback(err, null)

      const t = _.uniqBy(_.flatten(releases), function (i) {
        return i.uid
      })

      return callback(null, t)
    }
  )
}

/**
 * Gets Releases that are overdue
 * @memberof Release
 * @static
 * @method getOverdue
 *
 * @param {Array} grpId Group Array of User
 * @param {function} callback MongoDB Query Callback
 */
releaseSchema.statics.getOverdue = function (grpId, callback) {
  if (_.isUndefined(grpId)) return callback('Invalid Group Ids - ReleaseSchema.GetOverdue()', null)

  const self = this

  // Disable cache (TEMP 01/04/2019)
  // const grpHash = hash(grpId);
  // const cache = global.cache;
  // if (cache) {
  //     const overdue = cache.get('tickets:overdue:' + grpHash);
  //     if (overdue)
  //         return callback(null, overdue);
  // }

  async.waterfall(
    [
      function (next) {
        return self
          .model(COLLECTION)
          .find({
            group: { $in: grpId },
            status: { $in: [0, 1] },
            deleted: false
          })
          .select('_id date updated')
          .lean()
          .exec(next)
      },
      function (releases, next) {
        const t = _.map(releases, function (i) {
          return _.transform(
            i,
            function (result, value, key) {
              if (key === '_id') result._id = value
              if (key === 'date') result.date = value
              if (key === 'updated') result.updated = value
            },
            {}
          )
        })

        return next(null, t)
      },
      function (releases, next) {
        const now = new Date()
        let ids = _.filter(releases, function (r) {
          if (!r.date && !r.updated) {
            return false
          }
          const date = new Date(r.date)
          const timeout = new Date(date)
          return now > timeout
        })

        ids = _.map(ids, '_id')

        return next(null, ids)
      },
      function (ids, next) {
        return self
          .model(COLLECTION)
          .find({ _id: { $in: ids } })
          .limit(50)
          .select('_id uid name updated date')
          .lean()
          .exec(next)
      }
    ],
    function (err, releases) {
      if (err) return callback(err, null)

      return callback(null, releases)
    }
  )
}


releaseSchema.statics.getCount = function (callback) {
  const q = this.model(COLLECTION)
    .countDocuments({ deleted: false })
    .lean()
  return q.exec(callback)
}

/**
 * Mark a release as deleted in MongoDb <br/><br/>
 * *Release has its ```deleted``` flag set to true*
 *
 * @memberof Release
 * @static
 * @method softDelete
 *
 * @param {Object} oId Release Object _id
 * @param {function} callback MongoDB Query Callback
 */
releaseSchema.statics.softDelete = function (oId, callback) {
  if (_.isUndefined(oId)) return callback('Invalid ObjectID - ReleaseSchema.SoftDelete()', null)

  const self = this

  return self.model(COLLECTION).findOneAndUpdate({ _id: oId }, { deleted: true }, { new: true }, callback)
}

releaseSchema.statics.softDeleteUid = function (uid, callback) {
  if (_.isUndefined(uid)) return callback({ message: 'Invalid UID - ReleaseSchema.SoftDeleteUid()' })

  return this.model(COLLECTION).findOneAndUpdate({ uid }, { deleted: true }, { new: true }, callback)
}

releaseSchema.statics.restoreDeleted = function (oId, callback) {
  if (_.isUndefined(oId)) return callback('Invalid ObjectID - ReleaseSchema.RestoreDeleted()', null)

  const self = this

  return self.model(COLLECTION).findOneAndUpdate({ _id: oId }, { deleted: false }, { new: true }, callback)
}

releaseSchema.statics.getDeleted = function (callback) {
  return this.model(COLLECTION)
    .find({ deleted: true })
    .populate('group')
    .sort({ uid: -1 })
    .limit(1000)
    .exec(callback)
}

module.exports = mongoose.model(COLLECTION, releaseSchema)
