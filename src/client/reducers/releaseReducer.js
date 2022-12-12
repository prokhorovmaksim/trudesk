import { fromJS, List } from 'immutable'
import { handleActions } from 'redux-actions'
import { FETCH_RELEASES, CREATE_RELEASE, DELETE_RELEASE, UNLOAD_RELEASES, UPDATE_RELEASE, RELEASE_EVENT } from 'actions/types'

const initialState = {
  releases: List([]),
  loading: false
}

const reducer = handleActions(
  {
    [FETCH_RELEASES.PENDING]: (state, action) => {
      return {
        ...state,
        loading: true
      }
    },

    [FETCH_RELEASES.SUCCESS]: (state, action) => {
      return {
        ...state,
        releases: fromJS(action.response.releases || []),
        loading: false
      }
    },

    [CREATE_RELEASE.SUCCESS]: (state, action) => {
      const release = action.response.release

      return {
        ...state,
        releases: state.releases.push(fromJS(release))
      }
    },

    [UPDATE_RELEASE.SUCCESS]: (state, action) => {
      const release = action.response.release
      const idx = state.releases.findIndex(n => {
        return n.get('_id') === release._id
      })

      return {
        ...state,
        releases: state.releases.set(idx, fromJS(release))
      }
    },

    [DELETE_RELEASE.SUCCESS]: (state, action) => {
      const idx = state.releases.findIndex(n => {
        return n.get('_id') === action.payload._id
      })
      return {
        ...state,
        releases: state.releases.delete(idx)
      }
    },

    [UNLOAD_RELEASES.SUCCESS]: state => {
      return {
        ...state,
        releases: state.releases.clear(),
        loading: false
      }
    }
  },
  initialState
)

export default reducer
