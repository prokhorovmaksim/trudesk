/*
 *       .                             .o8                     oooo
 *    .o8                             "888                     `888
 *  .o888oo oooo d8b oooo  oooo   .oooo888   .ooooo.   .oooo.o  888  oooo
 *    888   `888""8P `888  `888  d88' `888  d88' `88b d88(  "8  888 .8P'
 *    888    888      888   888  888   888  888ooo888 `"Y88b.   888888.
 *    888 .  888      888   888  888   888  888    .o o.  )88b  888 `88b.
 *    "888" d888b     `V88V"V8P' `Y8bod88P" `Y8bod8P' 8""888P' o888o o888o
 *  ========================================================================
 *  Author:     Chris Brame
 *  Updated:    4/12/19 12:20 AM
 *  Copyright (c) 2014-2019. All rights reserved.
 */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { makeObservable, observable } from 'mobx'
import { observer } from 'mobx-react'

import { fetchAccounts, unloadAccounts } from 'actions/accounts'
import { updateGroup } from 'actions/groups'
import { compose } from 'redux';
import { withTranslation } from 'react-i18next';

import BaseModal from 'containers/Modals/BaseModal'
import MultiSelect from 'components/MultiSelect'
import Button from 'components/Button'

import helpers from 'lib/helpers'
import $ from 'jquery'
import SpinLoader from 'components/SpinLoader'
import { fetchTicketTypes } from 'actions/tickets';

@observer
class EditGroupModal extends React.Component {
  @observable name = ''

  constructor (props) {
    super(props)
    makeObservable(this)
  }

  componentDidMount () {
    this.props.fetchAccounts({ type: 'customers', limit: -1 })
    this.props.fetchTicketTypes({ limit: -1 })
    this.name = this.props.group.name

    helpers.UI.inputs()
    helpers.UI.reRenderInputs()
    helpers.formvalidator()
  }

  componentDidUpdate () {
    helpers.UI.reRenderInputs()
  }

  componentWillUnmount () {
    this.props.unloadAccounts()
  }

  onFormSubmit (e) {
    e.preventDefault()
    const $form = $(e.target)
    if (!$form.isValid(null, null, false)) return false

    const payload = {
      _id: this.props.group._id,
      name: this.name,
      members: this.membersSelect.getSelected() || [],
      sendMailTo: this.sendMailToSelect.getSelected() || [],
      ticketTypes: this.ticketTypesSelect.getSelected() || []
    }

    this.props.updateGroup(payload)
  }

  onInputChange (e) {
    this.name = e.target.value
  }

  render () {
    const mappedAccounts = this.props.accounts
      .map(account => {
        return { text: account.get('fullname'), value: account.get('_id') }
      })
      .toArray()

    const allTicketTypes = this.props.ticketTypes
      .map(type => {
        return {text: type.get('name'), value: type.get('_id')}
      })
      .toArray()

    const selectedTicketTypes = this.props.group.ticketTypes.map(type => {
      return type._id
    })

    const selectedMembers = this.props.group.members.map(member => {
      return member._id
    })
    const selectedSendMailTo = this.props.group.sendMailTo.map(member => {
      return member._id
    })
    return (
      <BaseModal>
        <SpinLoader active={this.props.accountsLoading} />
        <div className={'mb-25'}>
          <h2>{this.props.t('Edit Group')}</h2>
        </div>
        <form className={'uk-form-stacked'} onSubmit={e => this.onFormSubmit(e)}>
          <div className={'uk-margin-medium-bottom'}>
            <label>{this.props.t('Group Name')}</label>
            <input
              type='text'
              className={'md-input'}
              value={this.name}
              onChange={e => this.onInputChange(e)}
              data-validation='length'
              data-validation-length={'min2'}
              data-validation-error-msg={this.props.t('Please enter a valid Group name. (Must contain 2 characters)')}
            />
          </div>
          <div className={'uk-margin-medium-bottom'}>
            <label style={{ marginBottom: 5 }}>{this.props.t('Group Members')}</label>
            <MultiSelect
              items={mappedAccounts}
              initialSelected={selectedMembers}
              onChange={() => {}}
              ref={r => (this.membersSelect = r)}
            />
          </div>
          <div className={'uk-margin-medium-bottom'}>
            <label style={{ marginBottom: 5 }}>{this.props.t('Send Notifications To')}</label>
            <MultiSelect
              items={mappedAccounts}
              initialSelected={selectedSendMailTo}
              onChange={() => {}}
              ref={r => (this.sendMailToSelect = r)}
            />
          </div>
          <div className={'uk-margin-medium-bottom'}>
            <label style={{ marginBottom: 5 }}>Possible ticket types</label>
            <MultiSelect
              items={allTicketTypes}
              initialSelected={selectedTicketTypes}
              onChange={() => {}}
              ref={r => (this.ticketTypesSelect = r)}
            />
          </div>
          <div className='uk-modal-footer uk-text-right'>
            <Button text={this.props.t('Close')} flat={true} waves={true} extraClass={'uk-modal-close'} />
            <Button text={this.props.t('Save Group')} flat={true} waves={true} style={'primary'} type={'submit'} />
          </div>
        </form>
      </BaseModal>
    )
  }
}

EditGroupModal.propTypes = {
  group: PropTypes.object.isRequired,
  accounts: PropTypes.object.isRequired,
  ticketTypes: PropTypes.object.isRequired,
  updateGroup: PropTypes.func.isRequired,
  fetchAccounts: PropTypes.func.isRequired,
  fetchTicketTypes: PropTypes.func.isRequired,
  unloadAccounts: PropTypes.func.isRequired,
  accountsLoading: PropTypes.bool.isRequired,
  ticketTypesLoading: PropTypes.bool.isRequired
}

const mapStateToProps = state => ({
  accounts: state.accountsState.accounts,
  accountsLoading: state.accountsState.loading,
  ticketTypes: state.ticketsState.types,
  ticketTypesLoading: state.ticketsState.loadingTicketTypes
})

export default compose(withTranslation(), connect(mapStateToProps, { updateGroup, fetchAccounts, fetchTicketTypes, unloadAccounts }
))(EditGroupModal)