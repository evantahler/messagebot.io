import React from 'react'
import Page from './../../components/layouts/page.js'
import Client from './../../components/utils/client.js'
import Router from 'next/router'
import Moment from 'moment'
import { Row, Col, Alert } from 'react-bootstrap'
import ReactHighcharts from 'react-highcharts'
import LazyIframe from './../../components/utils/lazyIframe.js'

export default class extends React.Component {
  constructor () {
    super()
    this.state = {
      client: new Client(),
      error: null,
      successMessage: null,
      list: {},
      lists: [],
      templates: [],
      template: {},
      transports: [],
      transport: {},
      funnel: {},
      personGuid: null,
      campaignId: 0
    }
  }

  componentDidMount () {
    let campaignId = Router.query.page

    this.setState({campaignId}, () => {
      this.loadCampaign()
      this.loadCampaignStats()
      this.loadTemplates()
      this.loadLists()
      this.loadTransports()
    })
  }

  loadCampaign () {
    const client = this.state.client

    client.action({campaignId: this.state.campaignId}, '/api/campaign', 'GET', (data) => {
      let campaign = data.campaign
      if (campaign.sendAt) { campaign.sendAt = new Date(Date.parse(campaign.sendAt)) }

      let state = {campaign}
      if (data.sampleMessage) {
        state.render = data.sampleMessage.body
        state.personGuid = data.sampleMessage.personGuid
      }

      this.setState(state, () => { this.hydrateCampaign() })
    }, (error) => this.setState({error}))
  }

  loadCampaignStats () {
    const client = this.state.client

    client.action({
      campaignId: this.state.campaignId,
      interval: 'date',
      start: new Date(0).getTime(),
      end: new Date().getTime()
    }, '/api/campaign/stats', 'GET', (data) => {
      let safeDivisor = data.totals.sentAt
      if (data.totals.sentAt === 0) { safeDivisor = Infinity }

      let funnel = data
      funnel.rates = {
        sentAt: Math.round(data.totals.sentAt / safeDivisor * 10000) / 100,
        readAt: Math.round(data.totals.readAt / safeDivisor * 10000) / 100,
        actedAt: Math.round(data.totals.actedAt / safeDivisor * 10000) / 100
      }

      this.setState({funnel: funnel})
    }, (error) => this.setState({error}))
  }

  hydrateCampaign () {
    let campaign = this.state.campaign

    this.state.lists.forEach((list) => {
      if (list.id === campaign.listId) { this.setState({list: list}) }
    })

    this.state.templates.forEach((template) => {
      if (template.id === campaign.templateId) {
        this.setState({template: template})
      }
    })

    this.state.transports.forEach((transport) => {
      if (transport.name === campaign.transport) {
        let campaignVariables = []

        transport.campaignVariables.forEach((v) => {
          let value = campaign.campaignVariables[v]
          if (!value) { value = '' }
          campaignVariables.push({ id: v, value: value })
        })

        this.setState({
          transport: transport,
          campaignVariables: campaignVariables
        })
      }
    })
  }

  loadTemplates () {
    // TODO: Pagination
    const client = this.state.client

    client.action({}, '/api/templates', 'GET', (data) => {
      this.setState({templates: data.templates}, () => {
        this.loadList()
        this.hydrateCampaign()
      })
    }, (error) => this.setState({error}))
  }

  loadList () {
    // TODO: Pagination
    const client = this.state.client

    client.action({listId: this.state.campaign.listId}, '/api/list', 'GET', (data) => {
      this.setState({list: data.list})
    }, (error) => this.setState({error}))
  }

  loadLists () {
    // TODO: Pagination
    const client = this.state.client

    client.action({}, '/api/lists', 'GET', (data) => {
      this.setState({lists: data.lists}, () => { this.hydrateCampaign() })
    }, (error) => this.setState({error}))
  }

  loadTransports () {
    // TODO: Pagination
    const client = this.state.client

    client.action({}, '/api/transports', 'GET', (data) => {
      let transports = []
      Object.keys(data.transports).forEach((transport) => {
        transports.push(data.transports[transport])
      })

      this.setState({transports: transports})
    }, (error) => this.setState({error}))
  }

  changePersonGuid (event) {
    this.setState({personGuid: event.target.value})
  }

  render () {
    if (!this.state.campaign) { return null }
    if (!this.state.list) { return null }
    if (!this.state.transport) { return null }
    if (!this.state.template) { return null }
    if (!this.state.funnel.sentAt) { return null }

    let sentAtSeries = []
    let readAtSeries = []
    let actedAtSeries = [];

    [
      {series: 'sentAt', collection: sentAtSeries},
      {series: 'readAt', collection: readAtSeries},
      {series: 'actedAt', collection: actedAtSeries}
    ].forEach((pool) => {
      this.state.funnel[pool.series].forEach((dayGroup) => {
        Object.keys(dayGroup).forEach((date) => {
          let total = 0
          Object.keys(dayGroup[date]).forEach((transports) => {
            total += dayGroup[date][transports]
          })
          pool.collection.push({x: new Date(date), y: total})
        })
      })
    })

    const chartConfig = {
      global: { useUTC: false },
      credits: { enabled: false },
      chart: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        type: 'spline'
      },
      title: false,
      xAxis: {
        type: 'datetime',
        tickPixelInterval: 150
      },
      yAxis: {
        title: { text: 'Created At' },
        plotLines: [{
          value: 0,
          width: 1,
          color: '#808080'
        }]
      },
      legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'top',
        floating: true
      },
      series: [
        {name: 'sent messages', data: sentAtSeries, color: 'orange'},
        {name: 'read messages', data: readAtSeries, color: 'blue'},
        {name: 'acted messages', data: actedAtSeries, color: 'green'}
      ]
    }

    return (
      <Page loggedIn client={this.state.client} error={this.state.error} successMessage={this.state.successMessage}>
        <Row>
          <Col md={12}>
            <h1>Campaign Stats: {this.state.campaign.name}</h1>
            <p>{this.state.campaign.description}</p>
            <h3 className='text-success'>Sent At: {Moment(this.state.campaign.sentAt).fromNow()}</h3>
          </Col>

          <Col md={4}>
            <h2>Funnel:</h2>

            <Alert bsStyle='warning'>
              <h4 className='text-success'>Sent: {this.state.funnel.totals.sentAt}</h4>
              <em>{this.state.funnel.rates.sentAt}%</em>
            </Alert>

            <h1>&#x21A1;</h1>

            <Alert bsStyle='info'>
              <h4 className='text-success'>Read: {this.state.funnel.totals.readAt}</h4>
              <em>{this.state.funnel.rates.readAt}%</em>
            </Alert>

            <h1>&#x21A1;</h1>

            <Alert bsStyle='success'>
              <h4 className='text-success'>Acted: {this.state.funnel.totals.actedAt}</h4>
              <em>{this.state.funnel.rates.actedAt}%</em>
            </Alert>

          </Col>

          <Col md={8}>
            <h2>Preview</h2>
            <p>personGuid: <input type='text' value={this.state.personGuid || ''} onChange={this.changePersonGuid} /></p>
            <hr />
            <LazyIframe body={this.state.render || ''} />
          </Col>

          <Col md={12}>
            <h2>Campaign Events</h2>
            <p><em>Only one type of event per message is counted most recent multiple is reported</em></p>

            <ReactHighcharts
              ref='chart'
              config={chartConfig}
              domProps={{
                style: {
                  minWidth: '310px',
                  height: '300px',
                  margin: '0'
                }
              }} />
          </Col>
        </Row>
      </Page>
    )
  }
}
