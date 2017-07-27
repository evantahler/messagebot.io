import React from 'react'
import Page from './../../components/layouts/page.js'
import Client from './../../components/utils/client.js'
import RecordsList from './../../components/utils/recordsList.js'
import StackedHistogram from './../../components/utils/stackedHistogram.js'

export default class extends React.Component {
  constructor () {
    super()
    this.state = {
      client: new Client(),
      error: null,
      section: 'messages'
    }
  }

  updateError (error) {
    this.setState({error})
  }

  render () {
    return (
      <Page loggedIn client={this.state.client} error={this.state.error} >
        <h1>Messages</h1>

        <StackedHistogram
          section={this.state.section}
          client={this.state.client}
          updateError={this.updateError.bind(this)}
        />

        <RecordsList
          section={this.state.section}
          client={this.state.client}
          updateError={this.updateError.bind(this)}
        />
      </Page>
    )
  }
}
