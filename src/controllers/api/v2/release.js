const apiUtils = require('../apiUtils');
const logger = require('../../../logger');
const Models = require('../../../models');
const permissions = require('../../../permissions');
const async = require('../../../public/js/vendor/async/async');


const releasesV2 = {}

releasesV2.create = function (req, res) {
  const postRelease =  req.body
  if (!postRelease) return apiUtils.sendApiError_InvalidPostData(res)
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
  const uid = req.params.uid
  const putRelease = req.body.release
  if (!uid || !putRelease) return apiUtils.sendApiError(res, 400, 'Invalid Parameters')

  // todo: complete this...
  Models.Release.getReleaseByUid(uid, function (err, release) {
    if (err) return apiUtils.sendApiError(res, 500, err.message)

    return apiUtils.sendApiSuccess(res, release)
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
  const uid = req.params.uid
  if (!uid) return apiUtils.sendApiError(res, 400, 'Invalid Parameters')

  Models.Release.softDeleteUid(uid, function (err, success) {
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