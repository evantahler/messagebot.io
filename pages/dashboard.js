import React from 'react'
import { Row, Col, Panel, Table, Glyphicon, Label } from 'react-bootstrap'
import Page from './../components/layouts/page.js'
import Client from './../components/utils/client.js'
import Link from 'next/link'
import Moment from 'moment'

export default class extends React.Component {
  constructor () {
    super()
    this.state = {
      client: new Client(),
      error: null,
      status: false,
      stats: {},
      campaigns: [],
      campaignFunnels: {},
      ranges: {
        'Today': {start: (Moment().startOf('day')), end: Moment()},
        'This Week': {start: (Moment().startOf('week')), end: Moment()},
        'This Month': {start: (Moment().startOf('month')), end: Moment()},
        'This Year': {start: (Moment().startOf('year')), end: Moment()}
      },
      sections: ['people', 'events', 'messages']
    }
  }

  componentDidMount () {
    this.loadStatus()
    this.loadStats()
    this.loadCampaigns()
  }

  loadStatus () {
    const client = this.state.client
    client.action({}, '/api/system/status', 'GET', (data) => {
      this.setState({status: data})
    }, (error) => this.setState({error}))
  }

  loadStats () {
    const client = this.state.client
    this.state.sections.forEach((section) => {
      Object.keys(this.state.ranges).forEach((range) => {
        client.action({
          searchKeys: ['guid'],
          searchValues: ['%'],
          interval: 'year',
          start: this.state.ranges[range].start.valueOf(),
          end: this.state.ranges[range].end.valueOf()
        }, '/api/' + section + '/aggregation', 'GET', (data) => {
          let total = 0

          Object.keys(data.aggregations).forEach((date) => {
            Object.keys(data.aggregations[date]).forEach((agg) => {
              total += data.aggregations[date][agg]
            })
          })

          let stats = this.state.stats
          if (!stats[range]) { stats[range] = {} }
          stats[range][section] = total
          this.setState({stats: stats})
        }, (error) => this.setState({error}))
      })
    })
  }

  loadCampaigns () {
    const client = this.state.client
    client.action({
      from: 0,
      size: 20,
      sent: true
    }, '/api/campaigns', 'GET', (data) => {
      this.setState({campaigns: data.campaigns})
      data.campaigns.forEach((campaign) => {
        this.loadCampaignStats(campaign)
      })
    }, (error) => this.setState({error}))
  }

  loadCampaignStats (campaign) {
    const client = this.state.client
    client.action({
      campaignId: campaign.id,
      interval: 'year',
      start: new Date(0).getTime(),
      end: new Date().getTime()
    }, '/api/campaign/stats', 'GET', (data) => {
      let safeDivisor = data.totals.sentAt
      if (data.totals.sentAt === 0) { safeDivisor = Infinity }

      let campaignFunnels = this.state.campaignFunnels
      campaignFunnels[campaign.id] = data
      campaignFunnels[campaign.id].rates = {
        sentAt: Math.round(data.totals.sentAt / safeDivisor * 10000) / 100,
        readAt: Math.round(data.totals.readAt / safeDivisor * 10000) / 100,
        actedAt: Math.round(data.totals.actedAt / safeDivisor * 10000) / 100
      }

      this.setState({campaignFunnels: campaignFunnels})
    }, (error) => this.setState({error}))
  }

  render () {
    const status = this.state.status
    let index = 0

    return (
      <Page loggedIn client={this.state.client} error={this.state.error}>
        <Row>
          <Col md={12}>
            <h1>
              <strong>{ status ? status.node.team.name : 'MessageBot' }</strong> {'@'} { status ? status.node.team.trackingDomain : null }
            </h1>
            <p>
              <span className='text-info'>MessageBot Version { status ? status.node.version : 'x' }</span>
            </p>
          </Col>

          <Col md={12}>
            <h2>Tracking</h2>
          </Col>

          <Col md={12}>
            {
              Object.keys(this.state.ranges).map((rangeKey) => {
                if (rangeKey === 'Minute') { return null }
                index++
                return (
                  <RangeCountBox
                    key={index}
                    stats={this.state.stats}
                    sections={this.state.sections}
                    index={index}
                    rangeKey={rangeKey}
                  />
                )
              })
            }
          </Col>

          <Col md={12}> <hr /> </Col>

          <Col md={12}>
            <h2>Sent Campaigns</h2>
          </Col>

          <Col md={12}>
            <Table striped bordered condensed hover responsive>
              <thead>
                <tr>
                  <th />
                  <th>Name</th>
                  <th>Sent At</th>
                  <th>Total Messages</th>
                  <th>Type</th>
                  <th>Transport</th>
                  <th>Stats</th>
                </tr>
              </thead>
              <tbody>
                {
                  this.state.campaigns.map((campaign) => {
                    return (
                      <CampaignStatsRow key={campaign.id} campaign={campaign} campaignFunnels={this.state.campaignFunnels} />
                    )
                  })
                }
              </tbody>
            </Table>
          </Col>
        </Row>
      </Page>
    )
  }
}

class CampaignStatsRow extends React.Component {
  render () {
    let campaign = this.props.campaign
    let campaignFunnel = this.props.campaignFunnels[campaign.id] || {rates: {}, totals: {}}

    return (
      <tr>
        <td><Link href={{pathname: `/campaign/stats`, query: {page: campaign.id}}} as={`/campaign/stats/${campaign.id}`}><a><Glyphicon glyph='signal' /></a></Link></td>
        <td><strong>{ campaign.name }</strong></td>
        <td>{ Moment(campaign.sentAt).fromNow() }</td>
        <td>{ campaignFunnel.totals.sentAt }</td>
        <td>{ campaign.type }</td>
        <td>{ campaign.transport }</td>
        <td>
          <p>
            <strong><span>Conversion Rate: <span className='badge'>{ campaignFunnel.rates.actedAt }%</span></span></strong>
          </p>
          <p>
            <Label bsStyle='danger'>{ campaignFunnel.totals.sentAt } Sent</Label> <Label bsStyle='info'>{ campaignFunnel.totals.readAt } Read</Label> <Label bsStyle='success'>{ campaignFunnel.totals.actedAt } Acted</Label>
          </p>
        </td>
      </tr>
    )
  }
}

class RangeCountBox extends React.Component {
  render () {
    let width = 4
    let style = 'default'
    if (this.props.index === 1) {
      width = 12
      style = 'info'
    }

    return (
      <Col md={width}>
        <Panel bsStyle={style} header={<h3> {this.props.rangeKey} </h3>}>
          <Row>
            {
              this.props.sections.map((section) => {
                let value = 0
                if (this.props.stats[this.props.rangeKey] && this.props.stats[this.props.rangeKey][section]) {
                  value = this.props.stats[this.props.rangeKey][section]
                }

                return (
                  <Col md={4} key={`${section}-${this.props.index}`}>
                    <Panel footer={section} className={'text-center'}>
                      <div className={'text-center'}>
                        <h5>{ value }</h5>
                      </div>
                    </Panel>
                  </Col>
                )
              })
            }
          </Row>
        </Panel>
      </Col>
    )
  }
}
