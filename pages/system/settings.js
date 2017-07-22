import React from 'react'
import Page from './../../components/layouts/page.js'
import Client from './../../components/utils/client.js'
import LazyTable from '../../components/utils/lazyTable.js'
import Moment from 'moment'

export default class extends React.Component {
  constructor () {
    super()
    this.state = {
      client: new Client(),
      status: false,
      error: null,
      settings: [],
      transports: [],
      team: []
    }
  }

  componentDidMount () {
    this.loadSettings()
    this.loadTransports()
  }

  loadSettings () {
    const client = this.state.client
    let settings = []
    let team = []

    client.action({}, '/api/settings', 'GET', (data) => {
      Object.keys(data.settings).forEach((k) => {
        settings.push(data.settings[k])
      })

      Object.keys(data.team).forEach((k) => {
        let value = data.team[k]
        if (k === 'createdAt' || k === 'updatedAt') {
          value = Moment(value).calendar()
        }
        team.push({id: k, value: value})
      })

      this.setState({settings: settings, team: team})
    }, (error) => this.setState({error}))
  }

  loadTransports () {
    const client = this.state.client
    let transports = []

    client.action({}, '/api/transports', 'GET', (data) => {
      Object.keys(data.transports).forEach(function (k) {
        transports.push(data.transports[k])
      })

      this.setState({transports: transports})
    }, (error) => this.setState({error}))
  }

  handleValueChange (setting) {
    const client = this.state.client

    client.action(setting, '/api/setting', 'PUT', (data) => {
      this.setState({successMessage: 'Setting Updated'})
      this.loadSettings()
    })
  }

  render () {
    return (
      <Page loggedIn client={this.state.client} error={this.state.error} >
        <h1>Settings</h1>

        <h2>Team</h2>
        <LazyTable objects={this.state.team} />

        <h2>Settings</h2>
        <LazyTable
          objects={this.state.settings}
          ignoredKeys={['id', 'teamId', 'createdAt']}
          inlineEdit={{ value: this.handleValueChange.bind(this) }}
        />

        <h2>Transports</h2>
        <LazyTable objects={this.state.transports} />
      </Page>
    )
  }
}
