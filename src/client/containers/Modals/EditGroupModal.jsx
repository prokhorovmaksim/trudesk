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
import { fetchTicketTypes } from 'actions/tickets'
import Table from 'components/Table'
import TableHeader from 'components/Table/TableHeader'
import TableRow from 'components/Table/TableRow'
import TableCell from 'components/Table/TableCell'
import EnableSwitch from 'components/Settings/EnableSwitch'

@observer
class EditGroupModal extends React.Component {
  @observable name = ''

  @observable workingDays = []
  @observable timezone = ''

  constructor (props) {
    super(props)
    makeObservable(this)
  }

  componentDidMount () {
    this.props.fetchAccounts({ type: 'customers', limit: -1 })
    this.props.fetchTicketTypes({ limit: -1 })
    this.name = this.props.group.name
    this.prepareDataForWorkingDays()
    this.showTimezones()

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
      ticketTypes: this.ticketTypesSelect.getSelected() || [],
      workingDays: this.workingDays,
      timezone: this.timezone
    }

    this.props.updateGroup(payload)
  }

  onInputChange (e) {
    this.name = e.target.value
  }


  prepareDataForWorkingDays () {
    if (this.props.group.workingDays.length > 0) {
      this.workingDays = this.props.group.workingDays
    } else {
      const workingDaysDefaultValues = Array.of(
        {
          number: 1,
          isEnabled: true,
          startTime: '10:00',
          endTime: '18:00'
        },
        {
          number: 2,
          isEnabled: true,
          startTime: '10:00',
          endTime: '18:00'
        },
        {
          number: 3,
          isEnabled: true,
          startTime: '10:00',
          endTime: '18:00'
        },
        {
          number: 4,
          isEnabled: true,
          startTime: '10:00',
          endTime: '18:00'
        },
        {
          number: 5,
          isEnabled: true,
          startTime: '10:00',
          endTime: '18:00'
        },
        {
          number: 6,
          isEnabled: false,
          startTime: '10:00',
          endTime: '18:00'
        },
        {
          number: 7,
          isEnabled: false,
          startTime: '10:00',
          endTime: '18:00'
        }
      )
      this.workingDays = workingDaysDefaultValues
    }
  }

  showTimezones() {
    const moment = require('moment-timezone');

    const selectorOptions = moment.tz.names()
      .reduce((memo, tz) => {
        memo.push({
          name: tz,
          offset: moment.tz(tz).utcOffset()
        });

        return memo;
      }, [])
      .sort((a, b) => {
        return a.offset - b.offset
      })
      .reduce((memo, tz) => {
        const timezone = tz.offset ? moment.tz(tz.name).format('Z') : ''

        return memo.concat(`<option value="${tz.name}">(GMT${timezone}) ${tz.name}</option>`)
      }, "");

    document.querySelector(".tz-selector").innerHTML = selectorOptions

    document.querySelector(".tz-selector").addEventListener("change", e => {
      this.timezone = e.target.value
      // console.log(dateTimeLocal.format("ddd, DD MMM YYYY HH:mm:ss"))
    });

    // initial value
    document.querySelector(".tz-selector").value = (this.props.group.timezone) ? this.props.group.timezone
      : moment.tz.guess()
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

    const dayNames = Array.of(
      this.props.t('Monday'),
      this.props.t('Tuesday'),
      this.props.t('Wednesday'),
      this.props.t('Thursday'),
      this.props.t('Friday'),
      this.props.t('Saturday'),
      this.props.t('Sunday')
    )

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
            <label style={{ marginBottom: 5 }}>{this.props.t('Possible ticket types')}</label>
            <MultiSelect
              items={allTicketTypes}
              initialSelected={selectedTicketTypes}
              onChange={() => {}}
              ref={r => (this.ticketTypesSelect = r)}
            />
          </div>
          <p style={{ marginTop: '10px', color: '#222', fontSize: '20px', paddingBottom: '15px' }}>
            <label style={{ marginBottom: 15 }}>{this.props.t('Working days')}</label>
            <p>
              <select className="tz-selector"></select>
            </p>
            <Table
              tableRef={ref => (this.workingDaysTable = ref)}
              style={{ margin: 0 }}
              extraClass={'pDataTable'}
              stickyHeader={true}
              striped={true}
              className={'md-input'}
              headers={[
                <TableHeader key={1} width={'30%'} text={this.props.t('Day of the week')} textAlign="center" />,
                <TableHeader key={2} width={'14%'} text={this.props.t('Working day')} textAlign="center" />,
                <TableHeader key={3} width={'28%'} text={this.props.t('Start time')} textAlign="center" />,
                <TableHeader key={4} width={'28%'} text={this.props.t('End time')} textAlign="center" />
              ]}
            >
              {this.workingDays.map(wDay => {
                return (
                  <TableRow
                    key={wDay.number}
                    className={'vam nbb'}
                    clickable={false}
                  >
                    <TableCell className={'vam nbb uk-text-center'}>
                      <span className={'uk-display-inline-block'}>{dayNames[wDay.number - 1]}</span>
                    </TableCell>
                    <TableCell className={'vam nbb uk-text-center'}>
                      <EnableSwitch
                        key={wDay.number}
                        stateName={`isWorkingDay-${wDay.number}`}
                        style={{ margin: '0 0 0 0' }}
                        labelStyle={{ display: 'none' }}
                        label={''}
                        leverClass="lever-for-working-days"
                        checked={wDay.isEnabled}
                        onChange={e => {
                          this.workingDays[wDay.number - 1].isEnabled = e.target.checked
                        }}
                      />
                    </TableCell>
                    <TableCell className={'vam nbb uk-text-center'}>
                      <input
                        id={`start-time-${wDay.number}`}
                        name="startTime"
                        type="time"
                        step="60"
                        value={wDay.startTime}
                        onChange={(e) => {this.workingDays[wDay.number - 1].startTime = e.target.value}}
                        pattern="[0-9]{2}:[0-9]{2}"
                      />
                    </TableCell>
                    <TableCell className={'vam nbb uk-text-center'}>
                      <input
                        id={`end-time-${wDay.number}`}
                        name="endTime"
                        type="time"
                        step="60"
                        value={wDay.endTime}
                        onChange={(e) => {this.workingDays[wDay.number - 1].endTime = e.target.value}}
                        pattern="[0-9]{2}:[0-9]{2}"
                      />
                    </TableCell>
                  </TableRow>
                )
              })}
            </Table>
          </p>

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