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
 *  Updated:    2/17/22 9:02 PM
 *  Copyright (c) 2014-2022. All rights reserved.
 */

import { call, put, takeLatest } from 'redux-saga/effects'
import { FETCH_RELEASE, UPDATE_RELEASE, DELETE_RELEASE, UNLOAD_RELEASE, HIDE_MODAL, CREATE_RELEASE } from 'actions/types'

import api from '../../api'
import Log from '../../logger'
import helpers from 'lib/helpers'

function * fetchRelease ({ payload }) {
  console.log("fetch release")
  try {
    const response = yield call(api.release.get, payload)
    yield put({ type: FETCH_RELEASE.SUCCESS, response })
  } catch (error) {
    const errorText = error.response ? error.response.data.error : error
    helpers.UI.showSnackbar(`Error: ${errorText}`, true)
    yield put({ type: FETCH_RELEASE.ERROR, error })
    Log.error(errorText, error)
  }
}

function * createRelease ({ payload, meta }) {
  try {
    const response = yield call(api.release.create, payload)
    yield put({ type: CREATE_RELEASE.SUCCESS, response, meta })
    yield put({ type: HIDE_MODAL.ACTION })
    helpers.UI.showSnackbar('Release Created')
  } catch (error) {
    const errorText = error.response ? error.response.data.error : error
    if (error.response && error.response.status !== (401 || 403)) {
      Log.error(errorText, error)
      helpers.UI.showSnackbar(`Error: ${errorText}`, true)
    }

    yield put({ type: CREATE_RELEASE.ERROR, error })
  }
}

function * updateRelease ({ payload }) {
  try {
    const response = yield call(api.release.update, payload)
    yield put({ type: UPDATE_RELEASE.SUCCESS, response })
    yield put({ type: HIDE_MODAL.ACTION })
  } catch (error) {
    const errorText = error.response ? error.response.data.error : error
    if (error.response && error.response.status !== (401 || 403)) {
      Log.error(errorText, error)
      helpers.UI.showSnackbar(`Error: ${errorText}`, true)
    }

    yield put({ type: UPDATE_RELEASE.ERROR, error })
  }
}

function * deleteRelease ({ payload }) {
  try {
    const response = yield call(api.release.delete, payload)
    yield put({ type: DELETE_RELEASE.SUCCESS, payload, response })
  } catch (error) {
    const errorText = error.response ? error.response.data.error : error
    if (error.response && error.response.status !== (401 || 403)) {
      Log.error(errorText, error)
      helpers.UI.showSnackbar(`Error: ${errorText}`, true)
    }

    yield put({ type: DELETE_RELEASE.ERROR, error })
  }
}

function * unloadThunk ({ payload, meta }) {
  try {
    yield put({ type: UNLOAD_RELEASE.SUCCESS, payload, meta })
  } catch (error) {
    Log.error(error)
  }
}

export default function * watch () {
  yield takeLatest(CREATE_RELEASE.ACTION, createRelease)
  yield takeLatest(FETCH_RELEASE.ACTION, fetchRelease)
  yield takeLatest(UPDATE_RELEASE.ACTION, updateRelease)
  yield takeLatest(DELETE_RELEASE.ACTION, deleteRelease)
  yield takeLatest(UNLOAD_RELEASE.ACTION, unloadThunk)
}
