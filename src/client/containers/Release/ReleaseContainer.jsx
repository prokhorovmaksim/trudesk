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
    console.log("did mount release")
    console.log(helpers.canUser('release:create'))
    this.props.fetchReleases()
  }

  componentDidUpdate () {
    helpers.resizeAll()
  }

  componentWillUnmount () {
    this.props.unloadReleases()
  }

  onEditRelease (release) {
    console.log("Edit release")
    console.log(release)
    this.props.showModal('EDIT_RELEASE', {
      edit: true,
      user: user.toJS()
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
        console.log("Delete release")
        console.log(releaseId)
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

      const ticketsCount = release.get('tickets').length
      console.log("ticketscount")
      console.log(ticketsCount)
      console.log(release.get('tickets'))
      return (
        <TableRow key={release.get('_id')} className={'vam nbb'} clickable={false}>
          <TableCell style={{ fontWeight: 500, padding: '18px 5px' }}>{release.get('name')}</TableCell>
          <TableCell style={{ padding: '18px 5px' }}>{release.getIn(['group', 'name'])}</TableCell>
          <TableCell style={{ padding: '18px 5px' }}>{ticketsCount}</TableCell>
          <TableCell style={{ padding: '18px 5px' }}>{formattedDate}</TableCell>
          <TableCell>
            <ButtonGroup>
              <Button
                icon={'edit'}
                extraClass={'hover-primary'}
                small={true}
                waves={true}
                onClick={() => this.onEditRelease(release.toJS())}
              />
              <Button
                icon={'delete'}
                extraClass={'hover-danger'}
                small={true}
                waves={true}
                onClick={() => this.onDeleteRelease(release.get('_id'))}
              />
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
            style={{ margin: 0 }}
            extraClass={'pDataTable'}
            stickyHeader={true}
            striped={true}
            headers={[
              <TableHeader key={1} width={'20%'} text={this.props.t('Name')} />,
              <TableHeader key={2} width={'30%'} text={this.props.t('Group')} />,
              <TableHeader key={2} width={'30%'} text={this.props.t('Tickets count')} />,
              <TableHeader key={3} width={'10%'} text={this.props.t('Date')} />,
              <TableHeader key={4} width={150} text={''} />
            ]}
          >
            {!this.props.loading && this.props.releases.size < 1 && (
              <TableRow clickable={false}>
                <TableCell colSpan={10}>
                  <h5 style={{ margin: 10 }}>{this.props.t('No Releases Found')}</h5>
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
