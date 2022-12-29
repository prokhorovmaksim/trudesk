import { createAction } from 'redux-actions'
import {
  FETCH_EXCLUSIONS,
  CREATE_EXCLUSION,
  DELETE_EXCLUSION,
  UPDATE_EXCLUSION
} from 'actions/types'


export const fetchExclusions = createAction(FETCH_EXCLUSIONS.ACTION)
export const createExclusion = createAction(
  CREATE_EXCLUSION.ACTION,
  payload => payload,
  () => ({ thunk: true })
)
export const updateExclusion = createAction(UPDATE_EXCLUSION.ACTION)
export const deleteExclusion = createAction(DELETE_EXCLUSION.ACTION)