import React from 'react'
import Page from './../components/layouts/page.js'
import RecordView from './../components/utils/recordView.js'
import Client from './../components/utils/client.js'

export default class extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      client: new Client(),
      error: null,
      guid: props.guid,
      recordType: 'event'
    }
  }

  static async getInitialProps ({ query }) {
    return {guid: query.page}
  }

  updateError (error) {
    this.setState({error})
  }

  render () {
    return (
      <Page loggedIn client={this.state.client} error={this.state.error} >
        <RecordView
          recordType={this.state.recordType}
          guid={this.state.guid}
          client={this.state.client}
          updateError={this.updateError.bind(this)}
        />
      </Page>
    )
  }
}
