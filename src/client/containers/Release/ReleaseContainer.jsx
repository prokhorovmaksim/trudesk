import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import Log from '../../logger'
import axios from 'axios'
import { fetchReleases, deleteRelease, unloadReleases, updateRelease } from 'actions/release'
import { showModal } from 'actions/common'
import { compose } from 'redux';
import { withTranslation } from 'react-i18next';

import PageTitle from 'components/PageTitle'
import PageContent from 'components/PageContent'
import Table from 'components/Table'
import TableHeader from 'components/Table/TableHeader'
import TableCell from 'components/Table/TableCell'
import TableRow from 'components/Table/TableRow'
import ButtonGroup from 'components/ButtonGroup'
import Button from 'components/Button'

import helpers from 'lib/helpers'
import UIKit from 'uikit'

class ReleaseContainer extends React.Component {
  constructor (props) {
    super(props)
  }

  componentDidMount () {
    this.props.fetchReleases()
  }

  componentDidUpdate () {
    //TODO nado peredelat, eto chtobi ne vislo
    this.props.fetchReleases()
    helpers.resizeAll()
  }

  componentWillUnmount () {
    this.props.unloadReleases()
  }

  onEditRelease (release) {
    this.props.showModal('EDIT_RELEASE', {
      edit: true,
      release: release
    })
  }

  openInfoRelease (release) {
    this.props.showModal('SHOW_RELEASE', {
      release: release
    })
  }

  onUpdateRelease() {
    const id = '63922bb1f34a2dcc9fdc1714'
    const payload = {
      _id: id,
      name: 'New name',
    }
    this.props.updateRelease(payload)
  }

  onDeleteRelease (releaseId) {
    UIKit.modal.confirm(
      `<h2>${this.props.t('Are you sure?')}</h2>
        <p style="font-size: 15px;">
            <span class="uk-text-danger" style="font-size: 15px;">${this.props.t('This is a permanent action.')}</span> 
        </p>
        `,
      () => {
        this.props.deleteRelease({ _id: releaseId })
      },
      {
        labels: { Ok: this.props.t('Yes'), Cancel: this.props.t('No') },
        confirmButtonClass: 'md-btn-danger'
      }
    )
  }

  render () {
    const tableItems = this.props.releases.map(release => {
      const formattedDate =
        helpers.formatDate(release.get('date'), helpers.getShortDateFormat()) +
        ', ' +
        helpers.formatDate(release.get('date'), helpers.getTimeFormat())

      const ticketsCount = release.get('tickets').size
      return (
        <TableRow key={release.get('_id')}
                  className={'vam nbb'}
                  clickable={true}
                  onClick={e => {
                    const td = e.target.closest('td')
                    const input = td.getElementsByTagName('button')
                    if (input.length > 0) return false
                    this.openInfoRelease(release.toJS())
                  }}>
          <TableCell style={{ padding: '18px 5px' }} />
          <TableCell style={{ fontWeight: 500, padding: '18px 5px 18px 5px' }}>{release.get('name')}</TableCell>
          <TableCell style={{ padding: '18px 5px' }}>{release.getIn(['group', 'name'])}</TableCell>
          <TableCell style={{ padding: '18px 5px' }}>{ticketsCount}</TableCell>
          <TableCell style={{ padding: '18px 5px' }}>{formattedDate}</TableCell>
          <TableCell>
            <ButtonGroup>
              {helpers.canUser('release:edit') && (
              <Button
                icon={'edit'}
                extraClass={'hover-primary'}
                small={true}
                waves={true}
                onClick={() => this.onEditRelease(release.toJS())}

              />)}
              {helpers.canUser('release:delete') && (
              <Button
                icon={'delete'}
                extraClass={'hover-danger'}
                small={true}
                waves={true}
                onClick={() => this.onDeleteRelease(release.get('_id'))}
              />)}
            </ButtonGroup>
          </TableCell>
        </TableRow>
      )
    })
    return (
      <div>
        <PageTitle
          title={this.props.t('Releases')}
          shadow={false}
          rightComponent={
            <div className={'uk-grid uk-grid-collapse'}>
              <div className={'uk-width-1-1 mt-15 uk-text-right'}>
                {helpers.canUser('release:create') && (
                  <Button
                    text={this.props.t('Create')}
                    flat={false}
                    small={true}
                    waves={false}
                    extraClass={'hover-success'}
                    onClick={() => {
                      this.props.showModal('CREATE_RELEASE')
                    }}
                  />
                )}
              </div>
            </div>
          }
        />
        <PageContent padding={0} paddingBottom={0} extraClass={'uk-position-relative'}>
          <Table
            style={{ margin: 0, paddingLeft: '20px' }}
            extraClass={'pDataTable'}
            stickyHeader={true}
            striped={true}
            headers={[
              <TableHeader key={1} width={45} text={''} />,
              <TableHeader key={2} width={'30%'} text={this.props.t('Name')} style={{ paddingLeft: '20px' }}/>,
              <TableHeader key={3} width={'30%'} text={this.props.t('Group')} />,
              <TableHeader key={4} width={'10%'} text={this.props.t('Tickets count')} />,
              <TableHeader key={5} width={'20%'} text={this.props.t('Date')} />,
              <TableHeader key={6} width={150} text={''} />
            ]}
          >
            {!this.props.loading && this.props.releases.size < 1 && (
              <TableRow clickable={false}>
                <TableCell colSpan={10}>
                  <h5 style={{ margin: 10, padding: '0 0 0 20px' }}>{this.props.t('No Releases Found')}</h5>
                </TableCell>
              </TableRow>
            )}
            {tableItems}
          </Table>
        </PageContent>
      </div>
    )
  }
}

ReleaseContainer.propTypes = {
  socket: PropTypes.object.isRequired,
  releases: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  updateRelease: PropTypes.func.isRequired,
  fetchReleases: PropTypes.func.isRequired,
  deleteRelease: PropTypes.func.isRequired,
  unloadReleases: PropTypes.func.isRequired,
  showModal: PropTypes.func.isRequired
}

const mapStateToProps = state => ({
  socket: state.shared.socket,
  releases: state.releaseState.releases,
  loading: state.releaseState.loading
})

export default compose(withTranslation(), connect(mapStateToProps, {
  fetchReleases,
  deleteRelease,
  unloadReleases,
  updateRelease,
  showModal
}))(ReleaseContainer)
