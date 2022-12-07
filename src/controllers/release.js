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
 *  Updated:    1/20/19 4:43 PM
 *  Copyright (c) 2014-2019. All rights reserved.
 */

const _ = require('lodash')
const releaseSchema = require('../models/release')
const permissions = require('../permissions')

const releaseController = {}

function handleError (res, err) {
  if (err) {
    return res.render('error', {
      layout: false,
      error: err,
      message: err.message
    })
  }
}

releaseController.get = function (req, res) {
  const user = req.user
  // if (_.isUndefined(user) || !permissions.canThis(user.role, 'release:create')) {
  //   req.flash('message', 'Permission Denied.')
  //   console.log("get release controller")
  //   return res.redirect('/')
  // }
  //TODO fix it!!!
  // if (_.isUndefined(user) || !permissions.canThis(user.role, 'release:create')) {
  //   req.flash('message', 'Permission Denied.')
  //   console.log("get release controller")
  //   return res.redirect('/')
  // }

  const content = {}
  content.title = 'release'
  content.nav = 'release'

  content.data = {}
  content.data.user = req.user
  content.data.common = req.viewdata
  content.data.releases = {}

  return res.render('release', content)
}

releaseController.create = function (req, res) {
  const user = req.user
  if (_.isUndefined(user) || !permissions.canThis(user.role, 'release:create')) {
    req.flash('message', 'Permission Denied.')
    return res.redirect('/')
  }

  const content = {}
  content.title = 'Release - Create'
  content.nav = 'release'

  content.data = {}
  content.data.user = req.user
  content.data.common = req.viewdata
  console.log("subviews")

  res.render('subviews/createNotice', content)
}

releaseController.edit = function (req, res) {
  console.log("subviews")
  const user = req.user
  if (_.isUndefined(user) || !permissions.canThis(user.role, 'release:update')) {
    req.flash('message', 'Permission Denied.')
    return res.redirect('/')
  }

  const content = {}
  content.title = 'Release - Edit'
  content.nav = 'release'

  content.data = {}
  content.data.user = req.user
  content.data.common = req.viewdata
  releaseSchema.getRelease(req.params.id, function (err, release) {
    if (err) return handleError(res, err)
    content.data.release = release

    res.render('subviews/editNotice', content)
  })
}

module.exports = releaseController
