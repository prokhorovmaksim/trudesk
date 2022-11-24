import React from 'react'
import { observer } from 'mobx-react'
import { makeObservable } from 'mobx'

import i18n from '../../i18n'

import PDropdown from 'components/PDropdown'

@observer
class LanguagesDropdownPartial extends React.Component {
  constructor (props) {
    super(props)

    makeObservable(this)
  }

  closeOnClick () {
    const dropElem = document.getElementById('language-drop')
    dropElem.classList.remove('pDropOpen')
  }

  changeFlag(newLanguage) {
    const flagElem = document.getElementById('flag-language')
    const newImage = newLanguage === 'ru' ? '/img/flag_rus.png' : '/img/flag_usa.png'
    flagElem.src = newImage
  }

  onLanguageChange(newLanguage) {
    i18n.changeLanguage(newLanguage);
    localStorage.setItem('lng', newLanguage);

    this.closeOnClick()
    this.changeFlag(newLanguage)
  }

  render () {
    return (
      <PDropdown
        ref={this.props.forwardedRef}
        id={'language-drop'}
        className={'language-drop'}
        showTitlebar={false}
        minHeight={80} // 255 with keyboard shortcuts
        minWidth={30}
        topOffset={-5}
        leftOffset={0}
        showArrow={false}
        isListItems={false}
      >
        <div className={'ldrop-content'}>
          <div className={'language-drop-actions'}>
            <div className={'action-change-language'}
                 onClick={() => this.onLanguageChange("en")}>
              <img src={'/img/flag_usa.png'} alt="flagUsa" />
              <span>English</span>
            </div>
            <div className={'action-change-language'}
                 onClick={() => this.onLanguageChange("ru")}>
              <img src={'/img/flag_rus.png'} alt="flagRus" />
              <span>Русский</span>
            </div>
          </div>
        </div>
      </PDropdown>
    )
  }
}

export default LanguagesDropdownPartial
