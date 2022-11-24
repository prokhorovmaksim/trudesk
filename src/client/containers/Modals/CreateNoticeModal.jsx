import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { PopoverColorPicker } from 'components/PopoverColorPicker'
import Button from 'components/Button'
import BaseModal from 'containers/Modals/BaseModal'
import { observer } from 'mobx-react'
import { makeObservable, observable } from 'mobx'
import { compose } from 'redux';
import { withTranslation } from 'react-i18next';

import { createNotice } from 'actions/notices'

import helpers from 'lib/helpers'
import $ from 'jquery'

@observer
class CreateNoticeModal extends React.Component {
  constructor (props) {
    super(props)

    makeObservable(this)
  }

  @observable name = ''
  @observable message = ''
  @observable color = ''
  @observable fontColor = ''

  componentDidMount () {
    this.color = '#4CAF50'
    this.fontColor = '#ffffff'

    helpers.UI.inputs()
    helpers.UI.reRenderInputs()
    helpers.formvalidator()
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    helpers.UI.reRenderInputs()
  }

  onInputChange (target, e) {
    this[target] = e.target.value
  }

  onFormSubmit (e) {
    e.preventDefault()
    const $form = $(e.target)
    if (!$form.isValid(null, null, false)) return false

    const payload = {
      name: this.name,
      message: this.message,
      color: this.color,
      fontColor: this.fontColor
    }

    this.props.createNotice(payload).then(() => {
      helpers.resizeAll()
    })
  }

  render () {
    return (
      <BaseModal {...this.props} options={{ bgclose: false }}>
        <div className={'mb-25'}>
          <h2>{this.props.t('Create Notice')}</h2>
        </div>
        <form className={'uk-form-stacked'} onSubmit={e => this.onFormSubmit(e)}>
          <div className={'uk-margin-medium-bottom'}>
            <label>{this.props.t('Name')}</label>
            <input
              type='text'
              className={'md-input'}
              value={this.name}
              onChange={e => this.onInputChange('name', e)}
              data-validation='length'
              data-validation-length={'min2'}
              data-validation-error-msg={this.props.t('Please enter a notice name. (Must contain 2 characters)')}
            />
          </div>
          <div className={'uk-margin-medium-bottom'}>
            <label>{this.props.t('Message')}</label>
            <textarea
              className={'md-input'}
              value={this.message}
              onChange={e => this.onInputChange('message', e)}
              data-validation='length'
              data-validation-length={'min10'}
              data-validation-error-msg={this.props.t('Please enter a notice message. (Must contain 10 characters)')}
            />
          </div>
          <div>
            <span style={{ display: 'inline-block', float: 'left', paddingTop: 5 }}>{this.props.t('Background Color')}</span>
            <PopoverColorPicker
              color={this.color}
              onChange={c => {
                this.color = c
              }}
              style={{ float: 'left', marginLeft: 5, marginRight: 15 }}
            />
            <span style={{ display: 'inline-block', float: 'left', paddingTop: 5 }}>{this.props.t('Font Color')}</span>
            <PopoverColorPicker
              color={this.fontColor}
              onChange={c => {
                this.fontColor = c
              }}
              style={{ float: 'left', marginLeft: 5 }}
            />
          </div>

          <div className='uk-modal-footer uk-text-right'>
            <Button text={this.props.t('Close')} flat={true} waves={true} extraClass={'uk-modal-close'} />
            <Button text={this.props.t('Create Notice')} flat={true} waves={true} style={'primary'} type={'submit'} />
          </div>
        </form>
      </BaseModal>
    )
  }
}

CreateNoticeModal.propTypes = {
  createNotice: PropTypes.func.isRequired
}

const mapStateToProps = state => ({})

export default compose(withTranslation(), connect(mapStateToProps, { createNotice }))(CreateNoticeModal)