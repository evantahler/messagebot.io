import React from 'react'
import Page from './../../components/layouts/page.js'
import RecordNew from './../../components/utils/recordNew.js'
import Client from './../../components/utils/client.js'

export default class extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      client: new Client(),
      error: null,
      recordType: 'person'
    }
  }

  updateError (error) {
    this.setState({error})
  }

  render () {
    return (
      <Page loggedIn client={this.state.client} error={this.state.error} >
        <RecordNew
          client={this.state.client}
          recordType={this.state.recordType}
          updateError={this.updateError.bind(this)}
        />
      </Page>
    )
  }
}
