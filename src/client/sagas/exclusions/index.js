import { call, put, takeLatest, takeEvery, select } from 'redux-saga/effects'
import Log from '../../logger'

import api from '../../api'
import {
  HIDE_MODAL,
  FETCH_EXCLUSIONS,
  CREATE_EXCLUSION,
  DELETE_EXCLUSION,
  UPDATE_EXCLUSION
} from 'actions/types'

import helpers from 'lib/helpers'


const getSessionUser = state => state.shared.sessionUser

function * fetchExclusions ({ payload }) {
  yield put({ type: FETCH_EXCLUSIONS.PENDING, payload })
  try {
    let response = null
    response = yield call(api.exclusion.get, payload)

    yield put({ type: FETCH_EXCLUSIONS.SUCCESS, response })
  } catch (error) {
    const errorText = error.response ? error.response.data.error : error
    helpers.UI.showSnackbar(`Error: ${errorText}`, true)
    yield put({ type: FETCH_EXCLUSIONS.ERROR, error })
    Log.error(errorText, error)
  }
}

function * createExclusion ({ payload }) {
  try {
    console.log('createExcl saga')
    console.log(payload)
    const response = yield call(api.exclusion.create, payload)
    const sessionUser = yield select(getSessionUser)
    yield put({ type: CREATE_EXCLUSION.SUCCESS, response, sessionUser })
    yield put({ type: HIDE_MODAL.ACTION })
  } catch (error) {
    const errorText = error.response ? error.response.data.error : error
    helpers.UI.showSnackbar(`Error: ${errorText}`, true)
    Log.error(errorText, error.response)
    yield put({ type: CREATE_EXCLUSION.ERROR, error })
  }
}

function * deleteExclusion ({ payload }) {
  try {
    const response = yield call(api.exclusion.delete, payload)
    yield put({ type: DELETE_EXCLUSION.SUCCESS, payload, response })
  } catch (error) {
    const errorText = error.response ? error.response.data.error : error
    helpers.UI.showSnackbar(`Error: ${errorText}`, true)
    yield put({ type: DELETE_EXCLUSION.ERROR, error })
    Log.error(errorText, error)
  }
}

function * updateExclusion ({ payload }) {
  try {
    const response = yield call(api.exclusion.update, payload)
    const sessionUser = yield select(getSessionUser)
    yield put({ type: UPDATE_EXCLUSION.SUCCESS, response, sessionUser })
    yield put({ type: HIDE_MODAL.ACTION })
  } catch (error) {
    const errorText = error.response ? error.response.data.error : error
    helpers.UI.showSnackbar(`Error: ${errorText}`, true)
    Log.error(errorText, error.response)
    yield put({ type: UPDATE_EXCLUSION.ERROR, error })
  }
}

export default function * watcher () {
  yield takeLatest(FETCH_EXCLUSIONS.ACTION, fetchExclusions)
  yield takeLatest(CREATE_EXCLUSION.ACTION, createExclusion)
  yield takeEvery(DELETE_EXCLUSION.ACTION, deleteExclusion)
  yield takeEvery(UPDATE_EXCLUSION.ACTION, updateExclusion)
}
