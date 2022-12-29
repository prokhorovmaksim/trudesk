import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { createExclusion } from 'actions/exclusion'
import BaseModal from './BaseModal'
import Button from 'components/Button'

import helpers from 'lib/helpers'

class CreateExclusionModal extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      exclName: ''
    }
  }

  componentDidMount () {
    helpers.UI.inputs()
    helpers.formvalidator()
  }

  onExclusionNameChanged (e) {
    this.setState({
      exclName: e.target.value
    })
  }

  onCreateExclusionSubmit (e) {
    e.preventDefault()
    this.props.createExclusion({ name: this.state.exclName })
  }

  render () {
    return (
      <BaseModal {...this.props} ref={i => (this.base = i)}>
        <form className={'uk-form-stacked'} onSubmit={e => this.onCreateExclusionSubmit(e)}>
          <div>
            <h2 className='nomargin mb-5'>Create new exclusion</h2>
            <label htmlFor='typeName'>Type name</label>
            <input
              value={this.state.exclName}
              onChange={e => this.onExclusionNameChanged(e)}
              type='text'
              className={'md-input'}
              name={'exclName'}
              data-validation={'length'}
              data-validation-length={'min1'}
              data-validation-error-msg={'Exclusion set name must contain at least 1 character'}
            />
          </div>
          <div className='uk-modal-footer uk-text-right'>
            <Button text={'Close'} flat={true} waves={true} extraClass={'uk-modal-close'} />
            <Button text={'Create'} style={'success'} type={'submit'} />
          </div>
        </form>
      </BaseModal>
    )
  }
}

CreateExclusionModal.propTypes = {
  createExclusion: PropTypes.func.isRequired
}

export default connect(
  null,
  { createExclusion }
)(CreateExclusionModal)