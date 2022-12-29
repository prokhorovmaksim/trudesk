import { fromJS, List } from 'immutable'
import { handleActions } from 'redux-actions'
import { FETCH_EXCLUSIONS, CREATE_EXCLUSION, DELETE_EXCLUSION, UPDATE_EXCLUSION } from 'actions/types'

const initialState = {
  exclusions: List([]),
  loading: false
}

const reducer = handleActions(
  {
    [FETCH_EXCLUSIONS.PENDING]: (state, action) => {
      return {
        ...state,
        loading: true
      }
    },

    [FETCH_EXCLUSIONS.SUCCESS]: (state, action) => {
      return {
        ...state,
        exclusions: fromJS(action.response.exclusions || []),
        loading: false
      }
    },

    [CREATE_EXCLUSION.SUCCESS]: (state, action) => {
      const release = action.response.exclusions

      return {
        ...state,
        exclusions: state.exclusions.push(fromJS(release))
      }
    },

    [UPDATE_EXCLUSION.SUCCESS]: (state, action) => {
      const release = action.response.exclusion
      const idx = state.exclusions.findIndex(n => {
        return n.get('_id') === release._id
      })

      return {
        ...state,
        exclusions: state.exclusions.set(idx, fromJS(release))
      }
    },

    [DELETE_EXCLUSION.SUCCESS]: (state, action) => {
      const idx = state.exclusions.findIndex(n => {
        return n.get('_id') === action.payload._id
      })
      return {
        ...state,
        exclusions: state.exclusions.delete(idx)
      }
    }
  },
  initialState
)

export default reducer
