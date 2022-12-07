/*
 *       .                             .o8                     oooo
 *    .o8                             "888                     `888
 *  .o888oo oooo d8b oooo  oooo   .oooo888   .ooooo.   .oooo.o  888  oooo
 *    888   `888""8P `888  `888  d88' `888  d88' `88b d88(  "8  888 .8P'
 *    888    888      888   888  888   888  888ooo888 `"Y88b.   888888.
 *    888 .  888      888   888  888   888  888    .o o.  )88b  888 `88b.
 *    "888" d888b     `V88V"V8P' `Y8bod88P" `Y8bod8P' 8""888P' o888o o888o
 *  ========================================================================
 *  Author:     Chris Brame
 *  Updated:    2/17/22 8:25 PM
 *  Copyright (c) 2014-2022. All rights reserved.
 */

const winston = require('../../../logger')
const apiUtils = require('../apiUtils')
const Release = require('../../../models/release')

const apiRelease = {}

apiRelease.create = async (req, res) => {
  const payload = req.body

  try {
    const release = await Release.create({
      name: payload.name,
      message: payload.message,
      color: payload.color,
      fontColor: payload.fontColor
    })

    return apiUtils.sendApiSuccess(res, { release })
  } catch (err) {
    winston.debug(err)
    return apiUtils.sendApiError(res, 500, err.message)
  }
}

apiRelease.get = function (req, res) {
  Release.find({}, function (err, releases) {
    if (err) return apiUtils.sendApiError(res, 500, err.message)

    return apiUtils.sendApiSuccess(res, { releases: releases })
  })
}

apiRelease.update = function (req, res) {
  var id = req.params.id
  var payload = req.body
  if (!id || !payload || !payload.name || !payload.message || !payload.color || !payload.fontColor)
    return apiUtils.sendApiError_InvalidPostData(res)

  Release.findOneAndUpdate({ _id: id }, payload, { new: true }, function (err, updatedRelease) {
    if (err) return apiUtils.sendApiError(res, 500, err.message)

    return apiUtils.sendApiSuccess(res, { release: updatedRelease })
  })
}

apiRelease.activate = function (req, res) {
  var id = req.params.id
  if (!id) return apiUtils.sendApiError_InvalidPostData(res)

  Release.updateMany({}, { active: false }, function (err) {
    if (err) return apiUtils.sendApiError(res, 500, err.message)

    Release.findOneAndUpdate({ _id: id }, { active: true }, function (err) {
      if (err) return apiUtils.sendApiError(res, 500, err.message)

      return apiUtils.sendApiSuccess(res)
    })
  })
}

apiRelease.clear = function (req, res) {
  Release.updateMany({}, { active: false }, function (err) {
    if (err) return apiUtils.sendApiError(res, 500, err.message)

    return apiUtils.sendApiSuccess(res)
  })
}

apiRelease.delete = function (req, res) {
  var id = req.params.id
  if (!id) return apiUtils.sendApiError_InvalidPostData(res)

  Release.findOneAndDelete({ _id: id }, function (err) {
    if (err) return apiUtils.sendApiError(res, 500, err.message)

    return apiUtils.sendApiSuccess(res)
  })
}

module.exports = apiRelease
