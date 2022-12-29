const apiUtils = require('../apiUtils');
const logger = require('../../../logger');
const Models = require('../../../models');
const winston = require("../../../logger");


const exclusionV2 = {}

exclusionV2.create = async function (req, res) {
  const body =  req.body
  if (!body) return apiUtils.sendApiError_InvalidPostData(res)

  try {
    let exclusionDirectoryEntity
    exclusionDirectoryEntity = await Models.Exclusion.create({
      name: body.name,
      days: body.days
    })
    return apiUtils.sendApiSuccess(res, { exclusion: exclusionDirectoryEntity })
  } catch (err) {
    winston.debug(err)
    console.log(err)
    return apiUtils.sendApiError(res, 500, err.message)
  }
}

exclusionV2.get = async (req, res) => {
  try {
    const exclusions = await Models.Exclusion.getExclusionDaysDirectories(function (result) {
      return apiUtils.sendApiSuccess(res, {
        exclusions: result,
      })
    })
  } catch (err) {
    logger.warn(err)
    return apiUtils.sendApiError(res, 500, err.message)
  }
}

exclusionV2.update = function (req, res) {
  var id = req.params.id
  var payload = req.body
  if (!id || !payload)
    return apiUtils.sendApiError_InvalidPostData(res)

  Models.Exclusion.findOneAndUpdate({ _id: id }, payload, { new: true }, function (err, updatedExclusion) {
    if (err) return apiUtils.sendApiError(res, 500, err.message)
    return apiUtils.sendApiSuccess(res, {exclusion: updatedExclusion})
  })
}

exclusionV2.delete = function (req, res) {
  const id = req.params.id
  if (!id) return apiUtils.sendApiError(res, 400, 'Invalid Parameters')

  Models.Exclusion.softDelete(id, function (err, success) {
    if (err) return apiUtils.sendApiError(res, 500, err.message)
    if (!success) return apiUtils.sendApiError(res, 500, 'Unable to delete exclusion')

    return apiUtils.sendApiSuccess(res, { deleted: true })
  })
}

module.exports = exclusionV2