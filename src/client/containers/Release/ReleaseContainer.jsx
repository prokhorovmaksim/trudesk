import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import Log from '../../logger'
import axios from 'axios'
import { fetchRelease, deleteRelease, unloadRelease } from 'actions/release'
import { showModal } from 'actions/common'
import { compose } from 'redux';
import { withTranslation } from 'react-i18next';

import { NOTICE_SHOW, NOTICE_CLEAR } from 'serverSocket/socketEventConsts'

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
    this.props.fetchRelease()
  }

  componentDidUpdate () {
    helpers.resizeAll()
  }

  componentWillUnmount () {
    this.props.unloadRelease()
  }

  onActivateRelease (releaseId) {
    console.log("activate release")
    // if (!helpers.canUser('release:activate')) {
    //   helpers.UI.showSnackbar(this.props.t('Unauthorized'), true)
    //   return
    // }

    // axios
    //   .put('/api/v2/release/' + releaseId + '/activate', { active: true })
    //   .then(() => {
    //     this.props.socket.emit(NOTICE_SHOW, { releaseId })
    //   })
    //   .catch(err => {
    //     Log.error(err)
    //     helpers.UI.showSnackbar(err, true)
    //   })
  }

  onDeactivateRelease () {
    // axios
    //   .get('/api/v1/notice/clearactive')
    //   .then(() => {
    //     this.props.socket.emit(NOTICE_CLEAR)
    //
    //     helpers.UI.showSnackbar(this.props.t('Notice has been deactivated'), false)
    //   })
    //   .catch(err => {
    //     Log.error(err)
    //     helpers.UI.showSnackbar(err, true)
    //   })
  }

  onEditRelease (release) {
    // this.props.showModal('EDIT_NOTICE', { release })
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
    const tableItems = this.props.releases.map(notice => {
      const formattedDate =
        helpers.formatDate(notice.get('date'), helpers.getShortDateFormat()) +
        ', ' +
        helpers.formatDate(notice.get('date'), helpers.getTimeFormat())
      return (
        <TableRow key={notice.get('_id')} className={'vam nbb'} clickable={false}>
          <TableCell style={{ padding: '18px 15px' }}>
            <span style={{ display: 'block', width: 15, height: 15, backgroundColor: notice.get('color') }} />
          </TableCell>
          <TableCell style={{ fontWeight: 500, padding: '18px 5px' }}>{notice.get('name')}</TableCell>
          <TableCell style={{ padding: '18px 5px' }}>{notice.get('message')}</TableCell>
          <TableCell style={{ padding: '18px 5px' }}>{formattedDate}</TableCell>
          <TableCell>
            <ButtonGroup>
              <Button
                icon={'spatial_audio_off'}
                style={'success'}
                small={true}
                waves={true}
                onClick={() => this.onActivateRelease(notice.get('_id'))}
              />
              <Button
                icon={'edit'}
                extraClass={'hover-primary'}
                small={true}
                waves={true}
                onClick={() => this.onEditRelease(notice.toJS())}
              />
              <Button
                icon={'delete'}
                extraClass={'hover-danger'}
                small={true}
                waves={true}
                onClick={() => this.onDeleteRelease(notice.get('_id'))}
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
                {helpers.canUser('release:deactivate') && (
                  <Button
                    text={this.props.t('Deactivate')}
                    flat={false}
                    small={true}
                    waves={false}
                    extraClass={'hover-accent'}
                    // onClick={() => this.onDeactivateRelease()}
                  />
                )}
                {helpers.canUser('release:create') && (
                  <Button
                    text={this.props.t('Create')}
                    flat={false}
                    small={true}
                    waves={false}
                    extraClass={'hover-success'}
                    onClick={() => {
                      // this.props.showModal('CREATE_NOTICE')
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
              <TableHeader key={0} width={45} height={50} text={''} />,
              <TableHeader key={1} width={'20%'} text={this.props.t('Name')} />,
              <TableHeader key={2} width={'60%'} text={this.props.t('Message')} />,
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

  fetchRelease: PropTypes.func.isRequired,
  deleteRelease: PropTypes.func.isRequired,
  unloadRelease: PropTypes.func.isRequired,
  showModal: PropTypes.func.isRequired
}

const mapStateToProps = state => ({
  socket: state.shared.socket,
  releases: state.releaseState.releases,
  loading: state.releaseState.loading
})

export default compose(withTranslation(), connect(mapStateToProps, {
  fetchRelease,
  deleteRelease,
  unloadRelease,

  showModal
}))(ReleaseContainer)
