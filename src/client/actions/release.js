import { createAction } from 'redux-actions'
import {
  FETCH_RELEASES,
  CREATE_RELEASE,
  DELETE_RELEASE,
  UNLOAD_RELEASES,
  UPDATE_RELEASE,
  RELEASE_EVENT
} from 'actions/types'


export const fetchReleases = createAction(FETCH_RELEASES.ACTION)
export const createRelease = createAction(CREATE_RELEASE.ACTION)
export const updateRelease = createAction(UPDATE_RELEASE.ACTION)
export const deleteRelease = createAction(DELETE_RELEASE.ACTION)
export const unloadReleases = createAction(
  UNLOAD_RELEASES.ACTION,
  payload => payload,
  () => ({ thunk: true })
)
export const releaseEvent = createAction(RELEASE_EVENT.ACTION)