import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { observer } from 'mobx-react'
import { makeObservable, observable } from 'mobx'
import axios from 'axios'
import Log from '../../logger'
import { compose } from 'redux';
import { withTranslation } from 'react-i18next';

import { updateRelease } from 'actions/accounts'
import { fetchGroups, unloadGroups } from 'actions/groups'
import { fetchTickets, unloadTickets } from 'actions/tickets'

import Button from 'components/Button'
import BaseModal from 'containers/Modals/BaseModal'
import SingleSelect from 'components/SingleSelect'
import MultiSelect from 'components/MultiSelect'

import helpers from 'lib/helpers'

@observer
class EditReleaseModal extends React.Component {
  @observable name = ''

  constructor (props) {
    super(props)
    makeObservable(this)
  }

  componentDidMount () {
    this.name = this.props.release.name

    this.props.fetchGroups({ type: 'all' })
    this.props.fetchTickets({ type: 'all' })

    helpers.UI.inputs()
    helpers.UI.reRenderInputs()
  }

  componentDidUpdate () {
    helpers.UI.reRenderInputs()
  }

  componentWillUnmount () {
    this.props.unloadGroups()
  }


  onInputChanged (e, stateName) {
    this[stateName] = e.target.value
  }

  onSubmitEditRelease (e) {
    e.preventDefault()
    if (!this.props.edit) return

    const payload = {
      name: this.name,
      group: this.selectedGroup,
      tickets: this.ticketSelect ? this.ticketSelect.getSelected() : undefined
    }

    this.props.updateRelease(payload)
  }

  render () {
    const { release, edit } = this.props

    const groups = this.props.groups
      ? this.props.groups
        .map(group => {
          return { text: group.get('name'), value: group.get('_id') }
        })
        .toArray()
      : []

    const tickets = this.props.tickets
      ? this.props.tickets
        .map(ticket => {
          return {text: ticket.get('subject'), value: ticket.get('_id')}
        })
        .toArray()
      : []

    if (!release.tickets) release.tickets = []

    return (
      <BaseModal parentExtraClass={'pt-0'} extraClass={'p-0 pb-25'} options={{ bgclose: false }}>
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
                defaultValue={release.group}
                showTextbox={false}
                onSelectChange={e => this.onGroupSelectChange(e)}
              />
            </div>
            <div>
              <div className='uk-margin-medium-bottom'>
                <label className='uk-form-label'>{this.props.t('Tickets')}</label>
                <MultiSelect
                  items={tickets}
                  initialSelected={release.tickets.map(i => i._id)}
                  onChange={e => this.onTicketSelectChange(e)}
                  ref={r => (this.ticketSelect = r)}
                />
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
  updateRelease: PropTypes.func.isRequired,
  fetchGroups: PropTypes.func.isRequired,
  unloadGroups: PropTypes.func.isRequired,
  fetchTickets: PropTypes.func.isRequired,
  unloadTickets: PropTypes.func.isRequired
}

EditReleaseModal.defaultProps = {
  edit: false
}

const mapStateToProps = state => ({
  groups: state.groupsState.groups,
  tickets: state.ticketsState.tickets
})

export default compose(withTranslation(), connect(mapStateToProps, {
  updateRelease,
  fetchGroups,
  unloadGroups,
  fetchTickets,
  unloadTickets
}))(EditReleaseModal)