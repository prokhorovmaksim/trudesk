import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { observer } from 'mobx-react'
import { makeObservable, observable } from 'mobx'
import { compose } from 'redux';
import { withTranslation } from 'react-i18next';

import { updateExclusion } from 'actions/exclusion'
import BaseModal from './BaseModal'
import Button from 'components/Button'
import SingleSelect from 'components/SingleSelect'
import Grid from 'components/Grid'
import GridItem from 'components/Grid/GridItem'

import DatePicker from 'components/DatePicker'
import moment from 'moment'

import Table from 'components/Table'
import TableHeader from 'components/Table/TableHeader'
import TableRow from 'components/Table/TableRow'
import TableCell from 'components/Table/TableCell'
import EnableSwitchForTable from 'components/Settings/EnableSwitchForTable'
import helpers from 'lib/helpers'

@observer
class EditExclusionModal extends React.Component {

  @observable name = ''
  @observable currentExclusionDays = []
  @observable newDayObject = {}

  constructor(props) {
    super(props)
    makeObservable(this)

    this.state = {newDay: false, currentDisplayedExclusionDays: []}
  }

  componentDidMount() {

    this.name = this.props.exclusion.name
    this.currentExclusionDays = this.props.exclusion.days
    this.selectedYear = new Date().getFullYear()
    this.filterDaysByYear(this.selectedYear)

    helpers.UI.inputs()
    helpers.UI.reRenderInputs()
    helpers.formvalidator()
  }

  componentDidUpdate() {
    helpers.UI.reRenderInputs()
  }

  onNameInputChanged(e) {
    this.name = e.target.value
  }

  onYearSelectChange(e) {
    this.selectedYear = Number(e.target.value)
    this.filterDaysByYear(this.selectedYear)
  }

  filterDaysByYear(year) {
    const filtered = this.currentExclusionDays
      .filter(exclDay => {
        return new Date(exclDay.date).getFullYear() === year
      })
      .sort(this.sortDaysByDateASC)
    this.setState({currentDisplayedExclusionDays: filtered})
  }

  deleteDayFromExclusion(day) {
    const index = this.currentExclusionDays.indexOf(day)
    this.currentExclusionDays.splice(index, 1)

    this.filterDaysByYear(this.selectedYear)
  }

  addNewDay() {
    this.currentExclusionDays.push(this.newDayObject)
    this.filterDaysByYear(this.selectedYear)
    this.newDayObject = {}
    this.setState({newDay: false})
  }

  onFormSubmit(e) {
    e.preventDefault()

    const payload = {
      _id: this.props.exclusion._id,
      name: this.name,
      days: this.currentExclusionDays
    }

    this.props.updateExclusion(payload)
  }

  sortDaysByDateASC(a, b) {
    if (a.date > b.date) return 1
    if (a.date === b.date) return 0
    if (a.date < b.date) return -1
  }

  findIndexOfArrayElement(array, date) {
    for (let i = 0; i < array.length; i++) {
      if (array[i].date === date) {
        return i
      }
    }
    return undefined
  }

  render() {

    const thisYear = new Date().getFullYear()
    const firstYearOfThisSet = this.props.exclusion.days.length > 0
      ? new Date(this.props.exclusion.days
        .sort(this.sortDaysByDateASC)[0].date).getFullYear()
      : thisYear
    let years = []
    let currentYear = (firstYearOfThisSet <= thisYear) ? firstYearOfThisSet : thisYear
    while (currentYear <= thisYear + 10) {
      years.push({text: currentYear, value: currentYear})
      currentYear++
    }

    return (
      <BaseModal {...this.props} options={{bgclose: false}}>
        <div className={'mb-25'}>
          <h2>{this.props.t('Edit set of exclusion days')}</h2>
        </div>
        <div style={{margin: '24px 24px 0 24px'}}>
          <form className='uk-form-stacked' onSubmit={e => this.onFormSubmit(e)}>
            <div className='uk-margin-medium-bottom'>
              <label className='uk-form-label'>{this.props.t('Set name')}</label>
              <input
                type='text'
                value={this.name}
                className={'md-input'}
                onChange={e => this.onNameInputChanged(e)}
                data-validation={'length'}
                data-validation-length={'min1'}
                data-validation-error-msg={'Exclusion set name must contain at least 1 character'}
              />
            </div>
            <div className='uk-margin-medium-bottom'>
              <Grid>
                <GridItem width={'1-2'}>
                  <SingleSelect
                    items={years}
                    defaultValue={thisYear.toString()}
                    width={'100'}
                    showTextbox={false}
                    onSelectChange={e => this.onYearSelectChange(e)}
                  />
                </GridItem>
                <GridItem width={'1-2'}>
                  <div className={'uk-align-center valign-middle'}>
                    <Button
                      text={this.props.t('Add day')}
                      flat={false}
                      waves={false}
                      small={true}
                      extraClass={'hover-primary uk-align-center valign-middle'}
                      onClick={e => {
                        this.setState({newDay: true})
                      }}
                    />
                  </div>
                </GridItem>
              </Grid>
            </div>

            <p style={{marginTop: '10px', color: '#222', fontSize: '20px', paddingBottom: '15px'}}>
              <label className='uk-form-label' style={{marginBottom: 15}}>{this.props.t('Exclusion days')}</label>
              <Table
                key={this.state.currentDisplayedExclusionDays}
                tableRef={ref => (this.exclusionDaysTable = ref)}
                style={{margin: 0}}
                extraClass={'pDataTable'}
                stickyHeader={true}
                striped={true}
                className={'md-input'}
                headers={[
                  <TableHeader key={1} width={'33%'} text={this.props.t('Date')} textAlign="center" />,
                  <TableHeader key={2} width={'33%'} text={this.props.t('Working day')} textAlign="center" />,
                  <TableHeader key={3} width={'33%'} text={this.props.t('Management')} textAlign="center" />
                ]}
              >
                {this.state.currentDisplayedExclusionDays.map(exclDay => {
                  return (
                    <TableRow
                      key={exclDay.date}
                      className={'vam nbb'}
                      clickable={false}
                    >
                      <TableCell className={'vam nbb uk-text-center'}>
                        <div className={'uk-display-inline'}>
                          <label
                            className='uk-form-label'>{helpers.formatDate(exclDay.date, helpers.getShortDateFormat())}</label>
                        </div>
                      </TableCell>
                      <TableCell className={'vam nbb uk-text-center'}>
                        <EnableSwitchForTable
                          key={exclDay.date}
                          stateName={`isWorkingDay-${exclDay.date}`}
                          style={{margin: '0 0 0 0'}}
                          labelStyle={{display: 'none'}}
                          label={''}
                          leverClass="lever-for-working-days"
                          checked={exclDay.isEnabled}
                        />
                      </TableCell>
                      <TableCell className={'vam nbb uk-text-center'}>
                        <Button
                          text={this.props.t('Delete')}
                          flat={false}
                          waves={false}
                          small={true}
                          extraClass={'hover-accent uk-align-center valign-middle'}
                          onClick={e => {
                            this.deleteDayFromExclusion(exclDay)
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </Table>
            </p>

            {this.state.newDay &&
              <p style={{marginTop: '10px', color: '#222', fontSize: '20px', paddingBottom: '15px'}}>
                <Table
                  tableRef={ref => (this.newExclusionDayTable = ref)}
                  style={{margin: 0}}
                  extraClass={'pDataTable'}
                  stickyHeader={true}
                  striped={true}
                  className={'md-input'}
                >
                  <TableRow
                    className={'vam nbb'}
                    clickable={false}
                  >
                    <TableCell className={'vam nbb uk-text-center'}>
                      <div className={'uk-display-inline'}>
                        <DatePicker
                          name={'excl_day_date'}
                          format={helpers.getShortDateFormat()}
                          small={true}
                          value={''}
                          onChange={e => {
                            //const date = moment(e.target.value, helpers.getShortDateFormat())
                            //  .utc()
                            //  .toISOString()
                            const date = new Date(e.target.value)
                            date.setHours(12)
                            this.newDayObject.date = date
                          }}
                          validation={null}
                        />
                      </div>
                    </TableCell>
                    <TableCell className={'vam nbb uk-text-center'}>
                      <EnableSwitchForTable
                        key={this.newDayObject.date}
                        stateName={`isWorkingDay-${this.newDayObject.date}`}
                        style={{margin: '0 0 0 0'}}
                        labelStyle={{display: 'none'}}
                        label={''}
                        leverClass="lever-for-working-days"
                        checked={this.newDayObject.isEnabled}
                        onChange={e => {
                          this.newDayObject.isEnabled = e.target.checked
                        }}
                      />
                    </TableCell>
                    <TableCell className={'vam nbb uk-text-center'}>
                      <Button
                        text={this.props.t('Save')}
                        flat={false}
                        waves={false}
                        small={true}
                        extraClass={'hover-success uk-align-center valign-middle'}
                        onClick={e => {
                          this.addNewDay()
                        }}
                      />
                    </TableCell>
                  </TableRow>
                </Table>
              </p>}

            <div className='uk-modal-footer uk-text-right'>
              <Button text={this.props.t('Close')} flat={true} waves={true} extraClass={'uk-modal-close'} />
              <Button text={this.props.t('Save')} flat={true} waves={true} style={'success'} type={'submit'} />
            </div>
          </form>
        </div>
      </BaseModal>
    )
  }
}

EditExclusionModal.propTypes = {
  exclusion: PropTypes.object.isRequired,
  updateExclusion: PropTypes.func.isRequired,
}

const mapStateToProps = state => ({})

export default compose(withTranslation(), connect(mapStateToProps, {
  updateExclusion
}))(EditExclusionModal)