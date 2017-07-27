import React from 'react'
import Page from './../components/layouts/page.js'
import Link from 'next/link'
import { Row, Col } from 'react-bootstrap'
import RecordView from './../components/utils/recordView.js'
import LazyTable from './../components/utils/lazyTable.js'
import Client from './../components/utils/client.js'

export default class extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      client: new Client(),
      error: null,
      guid: props.guid,
      recordType: 'person'
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

        <hr />

        <RecentBehavior guid={this.state.guid} client={this.state.client} />
      </Page>
    )
  }
}

class RecentBehavior extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      client: props.client,
      guid: props.guid,
      from: 0,
      size: 100,
      events: [],
      messages: [],
      totalMessages: 0,
      totalEvents: 0
    }
  }

  loadRecentBehavior () {
    const client = this.state.client

    client.action({
      searchKeys: 'personGuid',
      searchValues: this.state.guid,
      from: this.state.from,
      size: this.state.size
    }, '/api/events/search', 'GET', (data) => {
      let events = []
      data.events.forEach((e) => {
        events.push({
          guid: e.guid,
          createdAt: e.createdAt,
          type: e.type
        })
      })

      this.setState({
        events: events,
        totalEvents: data.total
      })
    })

    client.action({
      searchKeys: 'personGuid',
      searchValues: this.state.guid,
      from: this.state.from,
      size: this.state.size
    }, '/api/messages/search', 'GET', (data) => {
      let messages = []
      data.messages.forEach((e) => {
        messages.push({
          guid: e.guid,
          createdAt: e.createdAt,
          transport: e.transport
        })
      })

      this.setState({
        messages: messages,
        totalMessages: data.total
      })
    })
  }

  componentDidMount () {
    this.loadRecentBehavior()
  }

  render () {
    return (
      <Row>

        <Col md={12}>
          <h2>Recent Behavior</h2>
        </Col>

        <Col md={6}>
          <h3><Link href={`/events/search/personGuid:${this.state.guid}`}><a>Events ({this.state.totalEvents} total)</a></Link></h3>
          <p><em>Showing {this.state.events.length} most recent</em></p>

          <LazyTable
            recordType={'event'}
            objects={this.state.events}
          />
        </Col>

        <Col md={6}>
          <h3><Link href={`/messages/search/personGuid:${this.state.guid}`}><a>Messages ({this.state.totalMessages} total)</a></Link></h3>
          <p><em>Showing {this.state.messages.length} most recent</em></p>

          <LazyTable
            recordType={'message'}
            objects={this.state.messages}
          />
        </Col>
      </Row>
    )
  }
}
