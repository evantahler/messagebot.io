import React from 'react'
import { Button } from 'react-bootstrap'

export default class extends React.Component {
  constructor () {
    super()
    this.state = {
      showModal: false
    }
  }

  sanitizedBody () {
    let body = this.props.body

    // set all verbs for image tracking to 'test'
    body = body.replace(/\/api\/message\/track.gif\?verb=read/g, '/api/message/track.gif?verb=test')
    body = body.replace(/\/api\/message\/track.gif\?verb=act/g, '/api/message/track.gif?verb=test')
    body = body.replace(/\/api\/message\/track.gif\?verb=read/g, '/api/message/track.gif?verb=test')

    // add padding without manipulating CSS below
    body += '<br />'

    return body
  }

  newTab () {
    let newWindow = window.open()
    newWindow.document.write(this.sanitizedBody())
  }

  render () {
    if (!this.props.body || this.props.body === '') {
      return null
    }

    setTimeout(() => {
      let body = this.sanitizedBody()
      let divs = ['bodyIframe', 'modalIframe']
      divs.forEach(function (div) {
        const iframe = document.getElementById(div)
        if (iframe) {
          iframe.contentWindow.document.open()
          iframe.contentWindow.document.write(body)
          iframe.contentWindow.document.close()

          const height = iframe.contentWindow.document.body.offsetHeight
          iframe.style.height = `${(height)}px`
        }
      })
    }, 100)

    return (
      <div>
        <iframe id='bodyIframe' scrolling='auto' frameBorder='0' width='100%' height='100%' />

        <Button onClick={this.newTab.bind(this)}>View in new tab</Button>
      </div>
    )
  }
}
