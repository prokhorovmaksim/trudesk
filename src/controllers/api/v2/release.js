const apiUtils = require('../apiUtils');
const logger = require('../../../logger');
const Models = require('../../../models');
const permissions = require('../../../permissions');
const async = require('../../../public/js/vendor/async/async');
const Notice = require("../../../models/notice");
const winston = require("../../../logger");
const Group = require("../../../models/group");
const Team = require("../../../models/team");
const Department = require("../../../models/department");
const apiUtil = require("../apiUtils");
const releaseSchema = require('../../../models/release');
const ticketSchema = require('../../../models/ticket');


const releasesV2 = {}

// releasesV2.create = function (req, res) {
//   const postRelease =  req.body
//   if (!postRelease) return apiUtils.sendApiError_InvalidPostData(res)
// }
releasesV2.create = async function (req, res) {
  const postRelease =  req.body
  if (!postRelease) return apiUtils.sendApiError_InvalidPostData(res)

  try {
    let releaseEntity
    // const releaseEntity = await Models.Release.create({
    //   name: postRelease.name,
    //   group: postRelease.group,
    //   tickets: postRelease.tickets
    // })

    if(postRelease.date) {
      releaseEntity = await Models.Release.create({
        name: postRelease.name,
        group: postRelease.group,
        tickets: postRelease.tickets,
        date: postRelease.date
      })
    } else {
      releaseEntity = await Models.Release.create({
        name: postRelease.name,
        group: postRelease.group,
        tickets: postRelease.tickets
      })
    }

    // adding connection with tickets
    releaseSchema.populate(releaseEntity, 'tickets', function (err, release) {
      for (let i = 0; i < release.tickets.length; i++) {
        ticketSchema.populate(release.tickets[i], 'release', function (err, t) {
          if (err) return true
          // remove ticket from previous release entity
          if (t.release) {
            try {
              const index = t.release.tickets.indexOf(t._id);
              if (index >= 0) {
                t.release.tickets.splice( index, 1 );
                t.release.save()
              }
            } catch (err) {
              console.log(err)
              winston.error(err)
            }
          }
          // change release in ticket entity
          t.release = release
          t.save()
        })
      }
    })
    savedId = releaseEntity._id

    return apiUtils.sendApiSuccess(res, { releaseEntity })
  } catch (err) {
    winston.debug(err)
    return apiUtils.sendApiError(res, 500, err.message)
  }
}

releasesV2.get = async (req, res) => {
  const query = req.query
  const type = query.type || 'all'

  let limit = 50
  let page = 0

  try {
    limit = query.limit ? parseInt(query.limit) : limit
    page = query.page ? parseInt(query.page) : page
  } catch (e) {
    logger.warn(e)
    return apiUtils.sendApiError_InvalidPostData(res)
  }

  const queryObject = {
    limit,
    page
  }

  try {
    let groups = []
    if (req.user.role.isAdmin || req.user.role.isAgent) {
      const dbGroups = await Models.Department.getDepartmentGroupsOfUser(req.user._id)
      groups = dbGroups.map(g => g._id)
    } else {
      groups = await Models.Group.getAllGroupsOfUser(req.user._id)
    }

    const mappedGroups = groups.map(g => g._id)

    switch (type.toLowerCase()) {
      case 'pending':
        queryObject.status = [0]
        break
      case 'overdue':
        queryObject.status = [1]
        break
      case 'closed':
        queryObject.status = [2]
        break
      case 'filter':
        try {
          queryObject.filter = JSON.parse(query.filter)
          queryObject.status = queryObject.filter.status
        } catch (error) {
          logger.warn(error)
        }
        break
    }

    if (!permissions.canThis(req.user.role, 'tickets:viewall', false)) queryObject.owner = req.user._id

    const releases = await Models.Release.getReleasesWithObject(mappedGroups, queryObject, null)
    const totalCount = await Models.Release.getCountWithObject(mappedGroups, queryObject)

    return apiUtils.sendApiSuccess(res, {
      releases: releases,
      count: releases.length,
      totalCount,
      page,
      prevPage: page === 0 ? 0 : page - 1,
      nextPage: page * limit + limit <= totalCount ? page + 1 : page
    })
  } catch (err) {
    logger.warn(err)
    return apiUtils.sendApiError(res, 500, err.message)
  }
}

releasesV2.single = async function (req, res) {
  const uid = req.params.uid
  if (!uid) return apiUtils.sendApiError(res, 400, 'Invalid Parameters')
  Models.Release.getReleaseByUid(uid, function (err, release) {
    if (err) return apiUtils.sendApiError(res, 500, err)

    if (req.user.role.isAdmin || req.user.role.isAgent) {
      Models.Department.getDepartmentGroupsOfUser(req.user._id, function (err, dbGroups) {
        if (err) return apiUtils.sendApiError(res, 500, err)

        const groups = dbGroups.map(function (g) {
          return g._id.toString()
        })

        if (groups.includes(release.group._id.toString())) {
          return apiUtils.sendApiSuccess(res, { release: release })
        } else {
          return apiUtils.sendApiError(res, 403, 'Forbidden')
        }
      })
    } else {
      Models.Group.getAllGroupsOfUser(req.user._id, function (err, userGroups) {
        if (err) return apiUtils.sendApiError(res, 500, err)

        const groupIds = userGroups.map(function (m) {
          return m._id.toString()
        })

        if (groupIds.includes(release.group._id.toString())) {
          return apiUtils.sendApiSuccess(res, { release: release })
        } else {
          return apiUtils.sendApiError(res, 403, 'Forbidden')
        }
      })
    }
  })
}

releasesV2.update = function (req, res) {
  var id = req.params.id
  var payload = req.body
  if (!id || !payload)
    return apiUtils.sendApiError_InvalidPostData(res)

  // delete release link in old tickets
  if (payload.tickets) {
    Models.Release.getReleaseById(id, function (err, release) {
      if (err) {
        console.log(err)
        return
      }
      for (let i = 0; i < release.tickets.length; i++) {
        if (!payload.tickets.includes(release.tickets[i]._id.toString())) {
          Models.Ticket.getTicketById(release.tickets[i]._id, function (err, ticket) {
            if (err) {
              console.log(err)
              return
            }
            if (!ticket) {
              console.log('Unable to locate ticket in ReleasesV2.update()')
              return
            }

            ticket.release = undefined
            ticket.save(function (err, t) {
              console.log('---- OLD TICKET SAVE ----')
              console.log(t)
              if (err) {
                console.log(err)
              }
            })
          })
        }
      }
    })
  }

  // save release
  Models.Release.findOneAndUpdate({ _id: id }, payload, { new: true }, function (err, updatedRelease) {
    if (err) return apiUtils.sendApiError(res, 500, err.message)
    if (payload.tickets && payload.tickets.length !== 0) {
      // adding connection with tickets
      releaseSchema.populate(updatedRelease, 'tickets', function (err, release) {
        for (let i = 0; i < release.tickets.length; i++) {
          if (release.tickets[i].release && release.tickets[i].release._id.toString() === id) {
            // same ticket = no need to update links
            continue
          }
          ticketSchema.populate(release.tickets[i], 'release', function (err, t) {
            if (err) return true
            if (t.release) {
              // remove ticket from previous release entity
              try {
                const index = t.release.tickets.indexOf(t._id);
                if (index >= 0) {
                  t.release.tickets.splice(index, 1);
                  t.release.save(function (err, rr) {
                    if (err) {
                      console.log(err)
                    }
                  })
                }
              } catch (err) {
                console.log(err)
                winston.error(err)
              }
            }
            // change release in ticket entity
            t.release = release
            t.save(function (err, ttt) {
              if (err) {
                console.log(err)
              }
            })
          })
        }
      })
    }
    return apiUtils.sendApiSuccess(res, {release: updatedRelease})
  })
}

releasesV2.batchUpdate = function (req, res) {
  const batch = req.body.batch
  if (!_.isArray(batch)) return apiUtils.sendApiError_InvalidPostData(res)

  async.each(
    batch,
    function (batchRelease, next) {
      Models.Release.getReleaseById(batchRelease.id, function (err, release) {
        if (err) return next(err)

        if (!_.isUndefined(batchRelease.status)) {
          release.status = batchRelease.status
        }

        return release.save(next)
      })
    },
    function (err) {
      if (err) return apiUtils.sendApiError(res, 400, err.message)

      return apiUtils.sendApiSuccess(res)
    }
  )
}

releasesV2.delete = function (req, res) {
  const id = req.params.id
  if (!id) return apiUtils.sendApiError(res, 400, 'Invalid Parameters')

  Models.Release.softDelete(id, function (err, success) {
    if (err) return apiUtils.sendApiError(res, 500, err.message)
    if (!success) return apiUtils.sendApiError(res, 500, 'Unable to delete release')

    return apiUtils.sendApiSuccess(res, { deleted: true })
  })
}

releasesV2.permDelete = function (req, res) {
  const id = req.params.id
  if (!id) return apiUtils.sendApiError(res, 400, 'Invalid Parameters')

  Models.Release.deleteOne({ _id: id }, function (err, success) {
    if (err) return apiUtils.sendApiError(res, 400, err.message)
    if (!success) return apiUtils.sendApiError(res, 400, 'Unable to delete release')

    return apiUtils.sendApiSuccess(res, { deleted: true })
  })
}

module.exports = releasesV2