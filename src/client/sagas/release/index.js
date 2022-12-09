import { call, put, takeLatest, takeEvery, select } from 'redux-saga/effects'
import Log from '../../logger'

import api from '../../api'
import {
  HIDE_MODAL,
  FETCH_RELEASES,
  CREATE_RELEASE,
  DELETE_RELEASE,
  UNLOAD_RELEASES,
  UPDATE_RELEASE,
  RELEASE_EVENT
} from 'actions/types'

import helpers from 'lib/helpers'


const getSessionUser = state => state.shared.sessionUser

function * fetchReleases ({ payload }) {
  yield put({ type: FETCH_RELEASES.PENDING, payload })
  try {
    let response = null
    // if (payload.type === 'search') response = yield call(api.releases.search, payload)
    // else response = yield call(api.releases.getWithPage, payload)
    response = yield call(api.release.get, payload)

    yield put({ type: FETCH_RELEASES.SUCCESS, response })
  } catch (error) {
    const errorText = error.response ? error.response.data.error : error
    helpers.UI.showSnackbar(`Error: ${errorText}`, true)
    yield put({ type: FETCH_RELEASES.ERROR, error })
    Log.error(errorText, error)
  }
}

function * createRelease ({ payload }) {
  try {
    console.log("saga")
    helpers.UI.showSnackbar(`Payload: ${payload}`, true)
    console.log(payload)
    const response = yield call(api.release.create, payload)
    const sessionUser = yield select(getSessionUser)
    yield put({ type: CREATE_RELEASE.SUCCESS, response, sessionUser })
    yield put({ type: HIDE_MODAL.ACTION })
  } catch (error) {
    const errorText = error.response ? error.response.data.error : error
    helpers.UI.showSnackbar(`Error: ${errorText}`, true)
    Log.error(errorText, error.response)
    yield put({ type: CREATE_RELEASE.ERROR, error })
  }
}

function * deleteRelease ({ payload }) {
  try {
    const response = yield call(api.release.delete, payload)
    yield put({ type: DELETE_RELEASE.SUCCESS, payload, response })
  } catch (error) {
    const errorText = error.response ? error.response.data.error : error
    helpers.UI.showSnackbar(`Error: ${errorText}`, true)
    yield put({ type: DELETE_RELEASE.ERROR, error })
    Log.error(errorText, error)
  }
}

function * unloadThunkReleases ({ payload, meta }) {
  try {
    yield put({ type: UNLOAD_RELEASES.SUCCESS, payload, meta })
  } catch (error) {
    Log.error(error)
  }
}

function * updateRelease ({ payload }) {
  try {
    const response = yield call(api.release.update, payload)
    const sessionUser = yield select(getSessionUser)
    yield put({ type: UPDATE_RELEASE.SUCCESS, response, sessionUser })
    yield put({ type: HIDE_MODAL.ACTION })
  } catch (error) {
    const errorText = error.response ? error.response.data.error : error
    helpers.UI.showSnackbar(`Error: ${errorText}`, true)
    Log.error(errorText, error.response)
    yield put({ type: UPDATE_RELEASE.ERROR, error })
  }
}

function * releaseEvent ({ payload }) {
  try {
    const sessionUser = yield select(getSessionUser)
    yield put({ type: RELEASE_EVENT.SUCCESS, payload, sessionUser })
  } catch (error) {
    Log.error(error)
  }
}

export default function * watcher () {
  yield takeLatest(FETCH_RELEASES.ACTION, fetchReleases)
  yield takeLatest(CREATE_RELEASE.ACTION, createRelease)
  yield takeEvery(DELETE_RELEASE.ACTION, deleteRelease)
  yield takeLatest(UNLOAD_RELEASES.ACTION, unloadThunkReleases)
  yield takeEvery(UPDATE_RELEASE.ACTION, updateRelease)
  yield takeEvery(RELEASE_EVENT.ACTION, releaseEvent)
}
