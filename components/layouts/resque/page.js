import React from 'react'
import Page from './../page.js'

import ResqueHeader from './../../resque/header.js'
import ResqueFooter from './../../resque/footer.js'

export default class extends React.Component {
  render () {
    return (
      <Page {...this.props}>
        <ResqueHeader {...this.props} />
        { this.props.children }
        <ResqueFooter {...this.props} />
      </Page>
    )
  }
}
