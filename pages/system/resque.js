import React from 'react'
import Page from './../../components/layouts/page.js'
import Client from './../../components/utils/client.js'

import ResqueHeader from './../../components/resque/header.js'
import ResqueFooter from './../../components/resque/footer.js'
import ResqueOverview from './../../components/resque/overview.js'
import ResqueFailed from './../../components/resque/failed.js'
import ResqueWorkers from './../../components/resque/workers.js'
import ResqueQueue from './../../components/resque/queue.js'
import ResqueDelayed from './../../components/resque/delayed.js'
import ResqueLocks from './../../components/resque/locks.js'

export default class extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      client: new Client(),
      error: null,
      timer: null,
      refreshInterval: 10,
      latestTick: 0
    }
  }

  componentDidMount () {
    this.tick()
  }

  updateRefeshInterval (refreshInterval) {
    this.setState({refreshInterval: refreshInterval}, () => {
      this.tick()
    })
  }

  componentWillUnmount () {
    clearTimeout(this.state.timer)
  }

  updateError (error) {
    this.setState({error})
  }

  tick () {
    clearTimeout(this.state.timer)
    this.setState({latestTick: new Date().getTime()})

    if (this.state.refreshInterval > 0) {
      this.state.timer = setTimeout(() => {
        this.tick()
      }, this.state.refreshInterval * 1000)
    }
  }

  render () {
    return (
      <Page loggedIn client={this.state.client} error={this.state.error} >
        <ResqueHeader refreshInterval={this.state.refreshInterval} updateRefeshInterval={this.updateRefeshInterval.bind(this)} />

        <ResqueOverview client={this.state.client} latestTick={this.state.latestTick} updateError={this.updateError.bind(this)} />
        <ResqueFailed client={this.state.client} latestTick={this.state.latestTick} updateError={this.updateError.bind(this)} />
        <ResqueWorkers client={this.state.client} latestTick={this.state.latestTick} updateError={this.updateError.bind(this)} />
        <ResqueQueue client={this.state.client} latestTick={this.state.latestTick} updateError={this.updateError.bind(this)} />
        <ResqueDelayed client={this.state.client} latestTick={this.state.latestTick} updateError={this.updateError.bind(this)} />
        <ResqueLocks client={this.state.client} latestTick={this.state.latestTick} updateError={this.updateError.bind(this)} />

        <ResqueFooter client={this.state.client} />
      </Page>
    )
  }
}
