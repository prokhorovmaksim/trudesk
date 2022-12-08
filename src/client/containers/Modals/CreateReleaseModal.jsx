import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { observer } from 'mobx-react'
import { makeObservable, observable } from 'mobx'
import { compose } from 'redux';
import { withTranslation } from 'react-i18next';

import { createRelease } from 'actions/release'
import { fetchGroups, unloadGroups } from 'actions/groups'
import { fetchTickets, unloadTickets } from 'actions/tickets'
import BaseModal from './BaseModal'
import Button from 'components/Button'
import SingleSelect from 'components/SingleSelect'
import MultiSelect from 'components/MultiSelect'

import $ from 'jquery'
import helpers from 'lib/helpers'

@observer
class CreateReleaseModal extends React.Component {
  @observable name = ''

  constructor (props) {
    super(props)
    makeObservable(this)
  }

  componentDidMount () {
    this.props.fetchGroups({ type: 'all' })
    this.props.fetchTickets({ type: 'all' })

    helpers.UI.inputs()
    helpers.formvalidator()
  }

  componentDidUpdate () {
    helpers.UI.reRenderInputs()
  }

  onInputChanged (e, name) {
    this[name] = e.target.value
  }

  onTicketSelectChange () {
    const selectedTickets = this.ticketSelect.getSelected()
    if (!selectedTickets || selectedTickets.length < 1) this.ticketSelectErrorMessage.classList.remove('hide')
    else this.ticketSelectErrorMessage.classList.add('hide')
  }

  onGroupSelectChange (e) {
    this.selectedGroup = e.target.value

    if (!this.selectedGroup || this.selectedGroup.length < 1) this.groupSelectErrorMessage.classList.remove('hide')
    else this.groupSelectErrorMessage.classList.add('hide')
  }

  onFormSubmit (e) {
    e.preventDefault()
    const $form = $(e.target)

    let isValid = true

    if (!$form.isValid(null, null, false)) isValid = false

    if (!this.selectedGroup || this.selectedGroup.length < 1) {
      this.groupSelectErrorMessage.classList.remove('hide')
      if (isValid) isValid = false
    } else this.groupSelectErrorMessage.classList.add('hide')

    const selectedTickets = this.ticketSelect ? this.ticketSelect.getSelected() : undefined
    if (selectedTickets) {
      if (selectedTickets.length < 1) {
        this.ticketSelectErrorMessage.classList.remove('hide')
        if (isValid) isValid = false
      } else this.ticketSelectErrorMessage.classList.add('hide')
    }

    if (!isValid) return

    const payload = {
      name: this.name,
      group: this.selectedGroup,
      tickets: this.ticketSelect ? this.ticketSelect.getSelected() : undefined,
    }

    this.props.createRelease(payload)
  }

  render () {
    const groups = this.props.groups
      .map(group => {
        return { text: group.get('name'), value: group.get('_id') }
      })
      .toArray()

    const tickets = this.props.tickets
      .map(ticket => {
        return { text: ticket.get('subject'), value: ticket.get('_id') }
      })
      .toArray()


    return (
      // <BaseModal parentExtraClass={'pt-0'} extraClass={'p-0 pb-25'}>
      <BaseModal {...this.props} options={{ bgclose: false }}>
        <div className={'mb-25'}>
          <h2>{this.props.t('Create Release')}</h2>
        </div>
        {/*<div style={{ margin: '24px 24px 0 24px' }}>*/}
        <div style={{ margin: '24px 24px 0 24px' }}>
          <form className='uk-form-stacked' onSubmit={e => this.onFormSubmit(e)}>
            <div className='uk-margin-medium-bottom'>
              <label className='uk-form-label'>{this.props.t('Release name')}</label>
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
            <div>
              <div className='uk-margin-medium-bottom'>
                <label className='uk-form-label'>{this.props.t('Group')}</label>
                <SingleSelect
                  items={groups}
                  width={'100'}
                  showTextbox={false}
                  onSelectChange={e => this.onGroupSelectChange(e)}
                />
                <span
                  className={'hide help-block'}
                  style={{ display: 'inline-block', marginTop: '3px', fontWeight: 'bold', color: '#d85030' }}
                  ref={r => (this.groupSelectErrorMessage = r)}
                >
                    {this.props.t('Please select a group for this release.')}
                  </span>
              </div>
            </div>
            <div>
              <div className='uk-margin-medium-bottom'>
                <label className='uk-form-label'>{this.props.t('Tickets')}</label>
                <MultiSelect
                  items={tickets}
                  onChange={e => this.onTicketSelectChange(e)}
                  ref={r => (this.ticketSelect = r)}
                />
                <span
                  className={'hide help-block'}
                  style={{ display: 'inline-block', marginTop: '3px', fontWeight: 'bold', color: '#d85030' }}
                  ref={r => (this.ticketSelectErrorMessage = r)}
                >
                    {this.props.t('Please select a tickets for this release.')}
                  </span>
              </div>
            </div>
            <div className='uk-modal-footer uk-text-right'>
              <Button text={this.props.t('Close')} flat={true} waves={true} extraClass={'uk-modal-close'} />
              <Button text={this.props.t('Create Release')} flat={true} waves={true} style={'success'} type={'submit'} />
            </div>
          </form>
        </div>
      </BaseModal>
    )
  }
}

CreateReleaseModal.propTypes = {
  groups: PropTypes.object.isRequired,
  tickets: PropTypes.object.isRequired,
  createRelease: PropTypes.func.isRequired,
  fetchGroups: PropTypes.func.isRequired,
  unloadGroups: PropTypes.func.isRequired,
  fetchTickets: PropTypes.func.isRequired,
  unloadTickets: PropTypes.func.isRequired
}

const mapStateToProps = state => ({
  groups: state.groupsState.groups,
  tickets: state.ticketsState.tickets
})

export default compose(withTranslation(), connect(mapStateToProps, {
  createRelease,
  fetchGroups,
  unloadGroups,
  fetchTickets,
  unloadTickets
}))(CreateReleaseModal)