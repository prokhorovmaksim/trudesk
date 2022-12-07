import { createAction } from 'redux-actions'
import { FETCH_RELEASE, CREATE_RELEASE, UPDATE_RELEASE, DELETE_RELEASE, UNLOAD_RELEASE } from 'actions/types'

export const fetchRelease = createAction(FETCH_RELEASE.ACTION)
export const createRelease = createAction(
  CREATE_RELEASE.ACTION,
  payload => payload,
  () => ({ thunk: true })
)
export const updateRelease = createAction(UPDATE_RELEASE.ACTION)
export const unloadRelease = createAction(
  UNLOAD_RELEASE.ACTION,
  payload => payload,
  () => ({ thunk: true })
)
export const deleteRelease = createAction(DELETE_RELEASE.ACTION)
