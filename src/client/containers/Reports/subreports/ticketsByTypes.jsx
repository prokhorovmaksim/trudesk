import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { fetchGroups, unloadGroups } from 'actions/groups'
import { fetchTicketTypes } from 'actions/tickets'
import { generateReport } from 'actions/reports'
import { compose } from 'redux';
import { withTranslation } from 'react-i18next';

import TruCard from 'components/TruCard'
import Grid from 'components/Grid'
import GridItem from 'components/Grid/GridItem'
import DatePicker from 'components/DatePicker'
import SingleSelect from 'components/SingleSelect'
import Button from 'components/Button'
import SpinLoader from 'components/SpinLoader'

import moment from 'moment-timezone'
import helpers from 'lib/helpers'
import i18n from "../../../i18n";

const ReportTicketsByTypes = () => {
  const groupsState = useSelector(state => state.groupsState)
  const ticketsState = useSelector(state => state.ticketsState)
  const dispatch = useDispatch()

  const [groups, setGroups] = useState([])
  const [types, setTypes] = useState([])

  const [isLoading, setIsLoading] = useState(false)

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedGroups, setSelectedGroups] = useState([])
  const [selectedTypes, setSelectedTypes] = useState([])

  useEffect(() => {
    helpers.UI.inputs()
    helpers.formvalidator()

    dispatch(fetchGroups())
    dispatch(fetchTicketTypes())

    setStartDate(
      moment()
        .utc(true)
        .subtract(30, 'days')
        .format(helpers.getShortDateFormat())
    )
    setEndDate(
      moment()
        .utc(true)
        .format(helpers.getShortDateFormat())
    )

    return () => {
      dispatch(unloadGroups())
    }
  }, [])

  useEffect(() => {
    helpers.UI.reRenderInputs()
  }, [startDate, endDate])

  useEffect(() => {
    const g = groupsState.groups.map(group => ({ text: group.get('name'), value: group.get('_id') })).toArray()
    g.push({ text: 'All', value: 'all' })
    setGroups(g)
  }, [groupsState])

  useEffect(() => {
    const t = ticketsState.types.map(type => ({ text: type.get('name'), value: type.get('_id') })).toArray()
    setTypes(t)
  }, [ticketsState])

  const onFormSubmit = e => {
    e.preventDefault()
    if (isLoading) return
    setIsLoading(true)
    dispatch(
      generateReport({
        type: 'tickets_by_type',
        filename: `report_tickets_by_type__${moment(startDate).format('MMDDYYYY')}`,
        startDate,
        endDate,
        groups: selectedGroups,
        types: selectedTypes
      })
    ).then(() => {
      setIsLoading(false)
    })
  }

  return (
    <div>
      <TruCard
        hover={false}
        header={
          <div style={{ padding: '10px 15px' }}>
            <h4 style={{ width: '100%', textAlign: 'left', fontSize: '14px', margin: 0 }}>{i18n.t('Tickets by' +
              ' Types')}</h4>
          </div>
        }
        extraContentClass={'nopadding'}
        content={
          <div>
            <SpinLoader active={isLoading} />
            <p className='padding-15 nomargin uk-text-muted'>
              {i18n.t('Please select the start and end dates and which groups to include in the report.')}
            </p>
            <hr className='uk-margin-large-bottom' style={{ marginTop: 0 }} />
            <div className={'padding-15'}>
              <form onSubmit={e => onFormSubmit(e)}>
                <Grid>
                  <GridItem width={'1-2'}>
                    <label htmlFor='filterDate_Start' className={'uk-form-label nopadding nomargin'}>
                      {i18n.t('Start Date')}
                    </label>
                    <DatePicker
                      name={'filterDate_start'}
                      format={helpers.getShortDateFormat()}
                      onChange={e => {
                        setStartDate(e.target.value)
                      }}
                      value={startDate}
                    />
                  </GridItem>
                  <GridItem width={'1-2'}>
                    <label htmlFor='filterDate_End' className={'uk-form-label nopadding nomargin'}>
                      {i18n.t('End Date')}
                    </label>
                    <DatePicker
                      name={'filterDate_End'}
                      format={helpers.getShortDateFormat()}
                      onChange={e => {
                        setEndDate(e.target.value)
                      }}
                      value={endDate}
                    />
                  </GridItem>
                  <GridItem width={'1-1'}>
                    <div className='uk-margin-medium-top uk-margin-medium-bottom'>
                      <label htmlFor='groups' className={'uk-form-label'}>
                        {i18n.t('Groups')}
                      </label>
                      <SingleSelect
                        multiple={true}
                        items={groups}
                        value={selectedGroups}
                        onSelectChange={(e, value) => {
                          setSelectedGroups(value)
                        }}
                      />
                    </div>
                  </GridItem>
                  <GridItem width={'1-1'}>
                    <div className='uk-margin-medium-top uk-margin-medium-bottom'>
                      <label htmlFor='priorities'>{i18n.t('Types')}</label>
                      <SingleSelect
                        multiple={true}
                        items={types}
                        value={selectedTypes}
                        onSelectChange={(e, value) => {
                          setSelectedTypes(value)
                        }}
                      />
                    </div>
                  </GridItem>
                  <GridItem width={'1-1'}>
                    <div>
                      <Button
                        disabled={isLoading}
                        text={i18n.t('Generate')}
                        type={'submit'}
                        style={'primary'}
                        waves={true}
                        small={true}
                      />
                    </div>
                  </GridItem>
                </Grid>
              </form>
            </div>
          </div>
        }
      />
    </div>
  )
}

export default compose(withTranslation())(ReportTicketsByTypes)