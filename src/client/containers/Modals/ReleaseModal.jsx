import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { hideModal } from 'actions/common'

import Button from 'components/Button'
import BaseModal from 'containers/Modals/BaseModal'
import { compose } from 'redux';
import { withTranslation } from 'react-i18next';

import helpers from 'lib/helpers'
import Table from 'components/Table'
import TableHeader from 'components/Table/TableHeader'
import TableRow from 'components/Table/TableRow'
import TableCell from 'components/Table/TableCell'

class ReleaseModal extends React.Component {
  onCloseClick (e) {
    e.preventDefault()

    this.props.hideModal('SHOW_RELEASE')
  }

  render () {
    const { release, shortDateFormat, timeFormat } = this.props
    const dateFormat = shortDateFormat + ', ' + timeFormat
    return (
      <BaseModal {...this.props} options={{ bgclose: false }} large={true}>
        <div>
          <div
            style={{
              width: '100%',
              height: '50px',
              marginBottom: '5px',
              position: 'absolute',
              top: 0,
              left: 0,
              padding: '7px 25px'
            }}
          >
            <h4 style={{ fontSize: '24px', marginTop: '15px', fontWeight: '300' }}>
              {release.name}
            </h4>
          </div>
          <div style={{ paddingBottom: '25px' }}>
            <p style={{ marginTop: '50px', color: '#222', fontSize: '20px', paddingBottom: '15px' }}>
              <label className='uk-form-label' style={{ fontSize: '20px', fontWeight: '500' }}>{this.props.t('Date')}</label>
              <label className='uk-form-label' style={{ fontSize: '18px' }}>{release.date}</label>

            </p>
            <p style={{ marginTop: '10px', color: '#222', fontSize: '20px', paddingBottom: '15px' }}>
              <label className='uk-form-label' style={{ fontSize: '20px', fontWeight: '500' }}>{this.props.t('Group')}</label>
              <label className='uk-form-label' style={{ fontSize: '18px' }}>{release.group.name}</label>

            </p>
            <p style={{ marginTop: '10px', color: '#222', fontSize: '20px', paddingBottom: '15px' }}>
              <label className='uk-form-label' style={{ fontSize: '20px', fontWeight: '500' }}>{this.props.t('Status')}</label>
              <label className='uk-form-label' style={{ fontSize: '18px' }}>{release.status}</label>

            </p>
            <p style={{ marginTop: '10px', color: '#222', fontSize: '20px', paddingBottom: '15px' }}>
              <label className='uk-form-label' style={{ fontSize: '20px', fontWeight: '500', paddingBottom: '15px' }}>{this.props.t('Tickets')}</label>
              <Table
                tableRef={ref => (this.ticketsTable = ref)}
                style={{ margin: 0 }}
                extraClass={'pDataTable'}
                stickyHeader={true}
                striped={true}
                headers={[
                  <TableHeader key={1} width={60} text={this.props.t('Status')} />,
                  <TableHeader key={2} width={65} text={'#'} />,
                  <TableHeader key={3} width={'40%'} text={this.props.t('Subject')} />,
                  <TableHeader key={4} width={'20%'} text={this.props.t('Created')} />,
                  <TableHeader key={8} width={'20%'} text={this.props.t('Due Date')} />,
                  <TableHeader key={9} width={'20%'} text={this.props.t('Updated')} />
                ]}
              >
                {this.props.release.tickets.size < 1 && (
                  <TableRow clickable={false}>
                    <TableCell colSpan={10}>
                      <h5 style={{ margin: 10 }}>{this.props.t('No Tickets Found')}</h5>
                    </TableCell>
                  </TableRow>
                )}
                {this.props.release.tickets.map(ticket => {
                    const status = () => {
                      switch (ticket.status) {
                        case 0:
                          return 'new'
                        case 1:
                          return 'open'
                        case 2:
                          return 'pending'
                        case 3:
                          return 'closed'
                      }
                    }

                    const assignee = () => {
                      const a = ticket.assignee
                      return !a ? '--' : a.fullname
                    }

                    const updated = ticket.updated
                      ? helpers.formatDate(ticket.updated, helpers.getShortDateFormat()) +
                      ', ' +
                      helpers.formatDate(ticket.updated, helpers.getTimeFormat())
                      : '--'

                    const dueDate = ticket.dueDate
                      ? helpers.formatDate(ticket.dueDate, helpers.getShortDateFormat())
                      : '--'

                    return (
                      <TableRow
                        key={ticket._id}
                        className={`ticket-${status()}`}
                        clickable={true}
                        onClick={e => {
                          const td = e.target.closest('td')
                          const input = td.getElementsByTagName('input')
                          if (input.length > 0) return false
                          this.props.hideModal('SHOW_RELEASE')
                          History.pushState(null, `Ticket-${ticket.uid}`, `/tickets/${ticket.uid}`)
                        }}
                      >
                        <TableCell className={`ticket-status ticket-${status()} vam nbb uk-text-center`}>
                          <span className={'uk-display-inline-block'}>{status()[0].toUpperCase()}</span>
                        </TableCell>
                        <TableCell className={'vam nbb'}>{ticket.uid}</TableCell>
                        <TableCell className={'vam nbb'}>{ticket.subject}</TableCell>
                        <TableCell className={'vam nbb'}>
                          {helpers.formatDate(ticket.date, helpers.getShortDateFormat())}
                        </TableCell>
                        <TableCell className={'vam nbb'}>{dueDate}</TableCell>
                        <TableCell className={'vam nbb'}>{updated}</TableCell>
                      </TableRow>
                    )
                  })}
              </Table>

            </p>
            <Button
              text={this.props.t('Close')}
              flat={true}
              style={'success'}
              extraClass={'uk-float-right'}
              styleOverride={{ marginBottom: 0 }}
              waves={true}
              onClick={e => this.onCloseClick(e)}
            />
          </div>
        </div>
      </BaseModal>
    )
  }
}

ReleaseModal.propTypes = {
  release: PropTypes.object.isRequired,
  shortDateFormat: PropTypes.string.isRequired,
  timeFormat: PropTypes.string.isRequired,
  hideModal: PropTypes.func.isRequired
}

export default compose(withTranslation(), connect(
  null,
  { hideModal }
))(ReleaseModal)