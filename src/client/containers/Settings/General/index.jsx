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
 *  Updated:    1/20/19 4:46 PM
 *  Copyright (c) 2014-2019. All rights reserved.
 */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import moment from 'moment-timezone'
import { updateSetting } from 'actions/settings'
import { deleteExclusion } from 'actions/exclusion'
import { showModal } from 'actions/common'

import SettingItem from 'components/Settings/SettingItem'

import InputWithSave from 'components/Settings/InputWithSave'
import SingleSelect from 'components/SingleSelect'
import SettingSubItem from 'components/Settings/SettingSubItem'
import Zone from 'components/ZoneBox/zone'
import ZoneBox from 'components/ZoneBox'
import Button from 'components/Button'
import ButtonGroup from 'components/ButtonGroup'

class GeneralSettings extends React.Component {
  constructor (props) {
    super(props)
  }

  componentDidMount () {}
  componentWillUnmount () {}

  getSettingsValue (name) {
    return this.props.settings.getIn(['settings', name, 'value'])
      ? this.props.settings.getIn(['settings', name, 'value'])
      : ''
  }

  updateSetting (stateName, name, value) {
    this.props.updateSetting({ stateName, name, value })
  }

  getTimezones () {
    return moment.tz
      .names()
      .map(function (name) {
        const year = new Date().getUTCFullYear()
        const timezoneAtBeginningOfyear = moment.tz(year + '-01-01', name)
        return {
          utc: timezoneAtBeginningOfyear.utcOffset(),
          text: '(GMT' + timezoneAtBeginningOfyear.format('Z') + ') ' + name,
          value: name
        }
      })
      .sort(function (a, b) {
        return a.utc - b.utc
      })
  }

  onTimezoneChange (e) {
    if (e.target.value) this.updateSetting('timezone', 'gen:timezone', e.target.value)
  }

  getExclusions () {
    return this.props.settings && this.props.settings.get('exclusions')
      ? this.props.settings.get('exclusions').toArray()
      : []
  }

  render () {
    const { active } = this.props

    const SiteTitle = (
      <InputWithSave
        stateName='siteTitle'
        settingName='gen:sitetitle'
        initialValue={this.getSettingsValue('siteTitle')}
      />
    )

    const SiteUrl = (
      <InputWithSave stateName='siteUrl' settingName='gen:siteurl' initialValue={this.getSettingsValue('siteUrl')} />
    )

    const Timezone = (
      <SingleSelect
        stateName='timezone'
        settingName='gen:timezone'
        items={this.getTimezones()}
        defaultValue={this.getSettingsValue('timezone')}
        onSelectChange={e => {
          this.onTimezoneChange(e)
        }}
        showTextbox={true}
      />
    )

    return (
      <div className={active ? 'active' : 'hide'}>
        <SettingItem
          title='Site Title'
          subtitle={
            <div>
              Title of site. Used as page title. <i>default: Trudesk</i>
            </div>
          }
          component={SiteTitle}
        />
        <SettingItem
          title='Site Url'
          subtitle={
            <div>
              Publicly accessible URL of this site. <i>ex: {this.props.viewdata.get('hosturl')}</i>
            </div>
          }
          component={SiteUrl}
        />
        <SettingItem
          title='Server Timezone'
          subtitle='Set the local server timezone for date display'
          tooltip='User can override in user profile. Requires Server Restart'
          component={Timezone}
        />
        <SettingItem
          title='Time & Date Format'
          subtitle={
            <a href='https://momentjs.com/docs/#/displaying/format/' rel='noopener noreferrer' target='_blank'>
              Moment.js Format Options
            </a>
          }
        >
          <Zone>
            <ZoneBox>
              <SettingSubItem
                title='Time Format'
                subtitle='Set the format for time display'
                component={
                  <InputWithSave
                    stateName='timeFormat'
                    settingName='gen:timeFormat'
                    initialValue={this.getSettingsValue('timeFormat')}
                    width={'60%'}
                  />
                }
              />
            </ZoneBox>
            <ZoneBox>
              <SettingSubItem
                title='Short Date Format'
                subtitle='Set the format for short dates'
                component={
                  <InputWithSave
                    stateName='shortDateFormat'
                    settingName='gen:shortDateFormat'
                    initialValue={this.getSettingsValue('shortDateFormat')}
                    width={'60%'}
                  />
                }
              />
            </ZoneBox>
            <ZoneBox>
              <SettingSubItem
                title='Long Date Format'
                subtitle='Set the format for long dates'
                component={
                  <InputWithSave
                    stateName='longDateFormat'
                    settingName='gen:longDateFormat'
                    initialValue={this.getSettingsValue('longDateFormat')}
                    width={'60%'}
                  />
                }
              />
            </ZoneBox>
          </Zone>
        </SettingItem>
        <SettingItem
          title={'Exclusion Days Directories'}
          subtitle={'Set/change exclusion days for different locations'}
          component={
            <Button
              text={'Create'}
              style={'success'}
              flat={true}
              waves={true}
              extraClass={'mt-10 right'}
              onClick={e => this.props.showModal('CREATE_EXCLUSION')}
            />
          }
        >
          <Zone>
            {this.getExclusions().map(excl => {
              return (
                <ZoneBox key={excl.get('_id')} extraClass={'priority-wrapper'}>
                  <SettingSubItem
                    parentClass={'view-priority'}
                    title={excl.get('name')}
                    subtitle={
                      <div>
                        Exclusion days count: <strong>{excl.get('days') ? excl.get('days').toArray().length : 0}</strong>
                      </div>
                    }
                    component={
                      <ButtonGroup classNames={'uk-float-right'}>
                        <Button text={'Edit'} small={true} onClick={e => {
                          this.props.showModal('EDIT_EXCLUSION', { exclusion: excl.toJS()})
                        }} />
                        <Button
                          text={'Remove'}
                          small={true}
                          style={'danger'}
                          onClick={e => this.props.deleteExclusion({ _id: excl.get('_id')})}
                        />
                      </ButtonGroup>
                    }
                  />
                </ZoneBox>
              )
            })}
          </Zone>
        </SettingItem>
      </div>
    )
  }
}

GeneralSettings.propTypes = {
  active: PropTypes.bool,
  updateSetting: PropTypes.func.isRequired,
  viewdata: PropTypes.object.isRequired,
  settings: PropTypes.object.isRequired,
  showModal: PropTypes.func.isRequired,
  deleteExclusion: PropTypes.func.isRequired
}

const mapStateToProps = state => ({
  viewdata: state.common.viewdata,
  settings: state.settings.settings
})

export default connect(mapStateToProps, { updateSetting, showModal, deleteExclusion })(GeneralSettings)
