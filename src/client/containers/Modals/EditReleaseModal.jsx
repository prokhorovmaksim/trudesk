import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {observer} from 'mobx-react'
import {makeObservable, observable} from 'mobx'
import {compose} from 'redux';
import {withTranslation} from 'react-i18next';

import {updateRelease} from 'actions/release'
import {fetchGroups, unloadGroups} from 'actions/groups'
import {fetchTickets, unloadTickets} from 'actions/tickets'

import Button from 'components/Button'
import BaseModal from 'containers/Modals/BaseModal'
import SingleSelect from 'components/SingleSelect'
import MultiSelectTickets from 'components/MultiSelectTickets'

import helpers from 'lib/helpers'

@observer
class EditReleaseModal extends React.Component {
  @observable name = ''

  constructor (props) {
    super(props)
    makeObservable(this)

    this.state = { currentTickets: null, isSet: false}
  }

  componentDidMount () {
    this.name = this.props.release.name
    this.selectedGroup = this.props.release.group._id

    this.props.fetchGroups({ type: 'all' })
    this.props.fetchTickets({ type: 'all' })

    helpers.UI.inputs()
    helpers.UI.reRenderInputs()
  }

  componentWillUnmount () {
    console.log("Unmount modal")
    this.props.fetchGroups({ type: 'all' })
    this.props.fetchTickets({ type: 'all' })
  }

  componentDidUpdate () {
    helpers.UI.reRenderInputs()
  }

  componentWillUnmount () {
    this.props.unloadGroups()
  }

  onTicketSelectChange () {
    // const selectedTickets = this.ticketSelect.getSelected()
    // if (!selectedTickets || selectedTickets.length < 1) this.ticketSelectErrorMessage.classList.remove('hide')
    // else this.ticketSelectErrorMessage.classList.add('hide')
  }

  showTicketsByGroup () {
    const newTickets = this.filterTickets()

    this.ticketSelect.deselectAll()
    this.ticketSelect.props.items = newTickets
    this.setState({ currentTickets: newTickets })
  }

  filterTickets () {
    return this.props.tickets
      .map(ticket => {
        const text =  ticket.get('release') ? `${ticket.get('subject')} (${ticket.getIn(['release', 'name'])})`
          : ticket.get('subject')
        if (this.selectedGroup === ticket.getIn(['group', '_id'])) {
          return {text: text, value: ticket.get('_id'), visibility: true}
        } else {
          return {text: text, value: ticket.get('_id'), visibility: false}
        }
      })
      .toArray()
  }

  onGroupSelectChange (e) {
    const isShouldUpdate = this.selectedGroup !== e.target.value

    this.selectedGroup = e.target.value
    if(isShouldUpdate) {
      this.showTicketsByGroup()
    }
  }


  onInputChanged (e, stateName) {
    this[stateName] = e.target.value
  }

  initialMultiSelectTickets () {
    if(this.selectedGroup === this.props.release.group._id) {
      return this.props.release.tickets.map(i => i._id)
    } else {
      return []
    }
  }

  initGroupAndTickets () {
    if(!this.state.isSet) {
      this.selectedGroup = this.props.release.group._id
      this.name = this.props.release.name
      this.props.loading = true
      this.setState({ isSet: true })
    }
  }

  onSubmitEditRelease (e) {
    e.preventDefault()
    if (!this.props.edit) return

    const payload = {
      _id: this.props.release._id
    }

    if(this.props.release.name !== this.name) {
      payload.name = this.name
    }

    if(this.props.release.group._id !== this.selectedGroup) {
      payload.group = this.selectedGroup
    }

    if(this.props.release.tickets !== this.ticketSelect.getSelected()) {
      payload.tickets = (this.ticketSelect && this.ticketSelect.getSelected()) ? this.ticketSelect.getSelected() : []
    }

    // const payload = {
    //   name: this.name,
    //   group: this.selectedGroup,
    //   tickets: this.ticketSelect ? this.ticketSelect.getSelected() : []
    // }

    this.props.updateRelease(payload)

    this.props.updateReleaseList()
  }

  render () {
    const { release, edit } = this.props

    this.initGroupAndTickets()

    const groups = this.props.groups
      .map(group => {
        return { text: group.get('name'), value: group.get('_id') }
      })
      .toArray()

    const tickets = this.filterTickets()

    return (
      <BaseModal parentExtraClass={'pt-0'} extraClass={'p-0 pb-25'} options={{ bgclose: false }}
                 large={true}>
        <div style={{ margin: '24px 24px 0 24px' }}>
          <form className='uk-form-stacked' onSubmit={e => this.onSubmitEditRelease(e)}>
            <div className='uk-margin-medium-bottom uk-clearfix'>
              <input
                type='text'
                className={'md-input'}
                value={this.name}
                onChange={e => this.onInputChanged(e, 'name')}
                data-validation={'length'}
                data-validation-length={'min1'}
                data-validation-error-msg={this.props.t('Release name must contain at least 1 characters.')}
              />
            </div>

            <div className='uk-margin-medium-bottom'>
              <label className='uk-form-label'>{this.props.t('Group')}</label>
              <SingleSelect
                items={groups}
                width={'100'}
                initialSelected={release.group._id}
                // defaultValue={{ text: release.group.name, value: release.group._id }}
                defaultValue={release.group._id}
                showTextbox={false}
                onSelectChange={e => this.onGroupSelectChange(e)}
              />
            </div>
            <div>
              <div className='uk-margin-medium-bottom'>
                <label className='uk-form-label'>{this.props.t('Tickets')}</label>
                {!this.props.loading && (
                  <MultiSelectTickets
                    items={tickets}
                    initialSelected={this.initialMultiSelectTickets()}
                    onChange={e => this.onTicketSelectChange(e)}
                    ref={r => (this.ticketSelect = r)}
                  />
                )}

              </div>
            </div>
            <div className='uk-modal-footer uk-text-right'>
              <Button text={this.props.t('Close')} flat={true} waves={true} extraClass={'uk-modal-close'} />
              <Button
                text={this.props.t('Save Release')}
                flat={true}
                waves={true}
                style={'primary'}
                type={'submit'}
                disabled={!edit}
              />
            </div>
          </form>
        </div>
      </BaseModal>
    )
  }
}

EditReleaseModal.propTypes = {
  edit: PropTypes.bool.isRequired,
  release: PropTypes.object.isRequired,
  groups: PropTypes.object.isRequired,
  tickets: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  updateRelease: PropTypes.func.isRequired,
  fetchGroups: PropTypes.func.isRequired,
  unloadGroups: PropTypes.func.isRequired,
  fetchTickets: PropTypes.func.isRequired,
  unloadTickets: PropTypes.func.isRequired,
  updateReleaseList: PropTypes.func.isRequired
}

EditReleaseModal.defaultProps = {
  edit: false,
  loading: true
}

const mapStateToProps = state => ({
  groups: state.groupsState.groups,
  tickets: state.ticketsState.tickets,
  loading: state.ticketsState.loading
})

export default compose(withTranslation(), connect(mapStateToProps, {
  updateRelease,
  fetchGroups,
  unloadGroups,
  fetchTickets,
  unloadTickets
}))(EditReleaseModal)