import { fromJS, List } from 'immutable'
import { handleActions } from 'redux-actions'
import { FETCH_RELEASE, UPDATE_RELEASE, DELETE_RELEASE, UNLOAD_RELEASE, CREATE_RELEASE } from 'actions/types'

const initialState = {
  releases: List([]),
  loading: false
}

const reducer = handleActions(
  {
    [FETCH_RELEASE.PENDING]: (state, action) => {
      console.log("pending release")
      return {
        ...state,
        loading: true
      }
    },

    [FETCH_RELEASE.SUCCESS]: (state, action) => {
      console.log("success release")
      return {
        ...state,
        releases: fromJS(action.response.releases || []),
        loading: false
      }
    },

    [CREATE_RELEASE.SUCCESS]: (state, action) => {
      console.log("create release")
      const release = action.response.release

      return {
        ...state,
        releases: state.releases.push(fromJS(release))
      }
    },

    [UPDATE_RELEASE.SUCCESS]: (state, action) => {
      console.log("update release")
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
      console.log("delete release")
      const idx = state.releases.findIndex(n => {
        return n.get('_id') === action.payload._id
      })
      return {
        ...state,
        releases: state.releases.delete(idx)
      }
    },

    [UNLOAD_RELEASE.SUCCESS]: state => {
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
