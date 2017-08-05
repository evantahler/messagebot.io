import React from 'react'
import Page from './../../components/layouts/page.js'
import Client from './../../components/utils/client.js'
import Router from 'next/router'
import Moment from 'moment'
import Datetime from 'react-datetime'
import Link from 'next/link'
import { Row, Col, Button, Form, FormGroup, ControlLabel, FormControl, Alert } from 'react-bootstrap'
import LazyTable from './../../components/utils/lazyTable.js'
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
      types: [],
      campaignVariables: [],
      personGuid: null,
      campaignId: 0,
      campaign: {name: '', description: ''}
    }
  }

  componentDidMount () {
    let campaignId = Router.query.page

    this.setState({campaignId}, () => {
      this.loadUser(() => {
        this.loadCampaign()
        this.loadTemplates()
        this.loadLists()
        this.loadTypes()
        this.loadTransports()
      })
    })
  }

  loadUser (callback) {
    const client = this.state.client
    client.action({}, '/api/user', 'GET', (data) => {
      this.setState({personGuid: data.user.personGuid}, callback)
    }, (error) => this.setState({error}))
  }

  loadCampaign () {
    const client = this.state.client
    client.action({campaignId: this.state.campaignId}, '/api/campaign', 'GET', (data) => {
      let campaign = data.campaign
      if (campaign.sendAt) { campaign.sendAt = new Date(Date.parse(campaign.sendAt)) }
      this.setState({campaign}, () => { this.hydrateCampaign() })
    }, (error) => this.setState({error}))
  }

  hydrateCampaign () {
    let campaign = this.state.campaign

    this.state.lists.forEach((list) => {
      if (list.id === campaign.listId) { this.setState({list: list}) }
    })

    this.state.templates.forEach((template) => {
      if (template.id === campaign.templateId) {
        this.setState({template: template}, () => {
          this.loadView()
        })
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

  loadTypes () {
    // TODO: Pagination
    const client = this.state.client

    client.action({}, '/api/campaigns/types', 'GET', (data) => {
      this.setState({types: data.validTypes})
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

  loadView () {
    const client = this.state.client

    if (!this.state.personGuid) { return }
    if (!this.state.template.id) { return }

    let params = {
      templateId: this.state.template.id,
      personGuid: this.state.personGuid,
      trackBeacon: false
    }

    let HTMLoptions = {
      credentials: 'include',
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(params)
    }

    const parent = this
    fetch(client.apiEndpoint() + '/api/template/render.html', HTMLoptions).then((response) => {
      response.text().then((body) => { parent.setState({render: body}) })
    }).catch((error) => this.setState({error}))
  }

  editCampaign () {
    const client = this.state.client
    let campaign = this.state.campaign
    campaign.campaignId = campaign.id

    this.state.campaignVariables.forEach(function (cv) {
      campaign.campaignVariables[cv.id] = cv.value
    })

    if (campaign.sendAt) { campaign.sendAt = campaign.sendAt.getTime() }
    if (campaign.campaignVariables) { campaign.campaignVariables = JSON.stringify(campaign.campaignVariables) }
    if (campaign.triggerEventMatch) { campaign.triggerEventMatch = JSON.stringify(campaign.triggerEventMatch) }

    client.action(campaign, '/api/campaign', 'PUT', (data) => {
      this.loadCampaign()
      this.setState({successMessage: 'Campaign Updated'})
    }, (error) => this.setState({error}))
  }

  deleteCampaign () {
    const client = this.state.client
    client.action({campaignId: this.state.campaignId}, '/api/campaign', 'DELETE', (data) => {
      Router.push('/campaigns/list')
    }, (error) => this.setState({error}))
  }

  inlinePropChange (event) {
    let campaign = this.state.campaign
    campaign[event.target.id] = event.target.value
    this.setState({campaign: campaign}, () => {
      this.hydrateCampaign()
    })
  }

  updateSendAt (date) {
    let campaign = this.state.campaign
    campaign.sendAt = date.toDate()
    this.setState({campaign: campaign})
  }

  changePersonGuid (event) {
    this.setState({personGuid: event.target.value})
  }

  handleCampaignVarialbeChangeNoOp () { }

  render () {
    return (
      <Page loggedIn client={this.state.client} error={this.state.error} successMessage={this.state.successMessage}>
        <Row>
          <Col md={12}>
            <h1>Campaign: <input type='text' id='name' value={this.state.campaign.name} onChange={this.inlinePropChange.bind(this)} /></h1>
            {(() => {
              if (this.state.campaign.sentAt) {
                return (
                  <Alert bsStyle='warning'>
                    <h4 className='text-success'>Sent At: { Moment(new Date(Date.parse(this.state.campaign.sentAt))).calendar() }</h4>
                    <Link href={`/campaign/stats/${this.state.campaign.id}`}><a>See Conversion Stats</a></Link>
                  </Alert>
                )
              }
            })()}
            <p>
              Description: <input size='50' type='text' id='description' value={this.state.campaign.description} onChange={this.inlinePropChange.bind(this)} />
            </p>

            <p>
              This is a
              {' '}
              <select id='type' value={this.state.campaign.type} onChange={this.inlinePropChange.bind(this)}>
                <option disabled='disabled'>Select...</option>
                {
                  this.state.types.map((type) => {
                    return <option key={type} value={type}>{type}</option>
                  })
                }
              </select>
              {' '}
              {' '}
              <select id='transport' value={this.state.campaign.transport} onChange={this.inlinePropChange.bind(this)}>
                {
                  this.state.transports.map((transport) => {
                    return <option key={transport.name} value={transport.name}>{transport.name}</option>
                  })
                }
              </select>
              {' '}
              campaign using the
              {' '}
              <select id='listId' value={this.state.campaign.listId} onChange={this.inlinePropChange.bind(this)} >
                {
                  this.state.lists.map((list) => {
                    return <option key={list.id} value={list.id}>{list.folder} / {list.name}</option>
                  })
                }
              </select>
              {' '}
              list and
              {' '}
              <select id='templateId' value={this.state.campaign.templateId} onChange={this.inlinePropChange.bind(this)}>
                {
                  this.state.templates.map((template) => {
                    return <option key={template.id} value={template.id}>{template.folder} / {template.name}</option>
                  })
                }
              </select>
              {' '}
              template.
            </p>

            <p>This list currently will send to {this.state.list.peopleCount} people</p>

            <Button onClick={this.editCampaign.bind(this)} bsStyle='primary'>Save</Button>{` `}
            <Button onClick={this.deleteCampaign.bind(this)} bsStyle='danger'>Delete</Button>
          </Col>

          <Col md={12}>
            <hr />
          </Col>

          <Col md={6}>
            <h2>Campaign Variables</h2>

            <LazyTable
              objects={this.state.campaignVariables}
              inlineEdit={{ value: this.handleCampaignVarialbeChangeNoOp.bind(this) }}
            />
          </Col>

          <Col md={6}>
            <h2>Options for a {this.state.campaign.type} campaign</h2>

            <Form horizontal>
              <FormGroup>
                <Col md={6}>
                  <ControlLabel>Send At</ControlLabel>
                </Col>
                <Col md={6}>
                  <Datetime value={this.state.campaign.sendAt} onChange={this.updateSendAt.bind(this)} />
                </Col>
              </FormGroup>
            </Form>

            <RecurringCampaignOptions campaign={this.state.campaign} />
            <TriggerCampaignOptions campaign={this.state.campaign} />
          </Col>

          <Col md={12}>
            <hr />
          </Col>

          <Col md={12}>
            <h2>Preview</h2>
            <p>personGuid: <input type='text' value={this.state.personGuid || ''} onChange={this.changePersonGuid.bind(this)} /></p>
            <hr />
            <LazyIframe body={this.state.render || ''} />
          </Col>

        </Row>
      </Page>
    )
  }
}

class RecurringCampaignOptions extends React.Component {
  constructor (props) {
    super(props)
    this.state = { campaign: props.campaign }
  }

  inlinePropChange (event) {
    let campaign = this.state.campaign
    campaign[event.target.id] = event.target.value
    this.setState({campaign: campaign})
  }

  render () {
    if (!this.state.campaign) { return null }
    if (this.state.campaign.type !== 'recurring') { return null }

    return (
      <Form horizontal>
        <FormGroup>
          <Col md={6}>
            <ControlLabel>Re-Send Delay (seconds)</ControlLabel>
          </Col>
          <Col md={6}>
            <FormControl id='reSendDelay' type='number' value={this.state.campaign.reSendDelay || 0} onChange={this.inlinePropChange.bind(this)} />
          </Col>
        </FormGroup>
      </Form>
    )
  }
}

class TriggerCampaignOptions extends React.Component {
  constructor (props) {
    super(props)

    let triggerEventMatch = []
    if (props.campaign && props.campaign.triggerEventMatch) {
      Object.keys(props.campaign.triggerEventMatch).forEach((key) => {
        triggerEventMatch.push({id: key, value: props.campaign.triggerEventMatch[key]})
      })
    }

    this.state = {
      campaign: props.campaign,
      triggerEventMatch: triggerEventMatch,
      pendingKey: '',
      pendingValue: ''
    }
  }

  updateCampaign () {
    let campaign = this.state.campaign
    campaign.triggerEventMatch = {}
    this.state.triggerEventMatch.forEach((tem) => {
      campaign.triggerEventMatch[tem.id] = tem.value
    })

    this.setState({campaign: campaign})
  }

  inlinePropChange (event) {
    let campaign = this.state.campaign
    campaign[event.target.id] = event.target.value
    this.setState({campaign: campaign})
  }

  handleEdit (row) {
    let i = 0
    let triggerEventMatch = this.state.triggerEventMatch
    while (i < triggerEventMatch.length) {
      let tem = triggerEventMatch[i]
      if (tem.id === row.id) { triggerEventMatch[i].value = row.value }
      i++
    }

    this.setState({triggerEventMatch: triggerEventMatch}, () => {
      this.updateCampaign()
    })
  }

  handleDestroy (event) {
    let i = 0
    while (i < this.state.triggerEventMatch.length) {
      let tem = this.state.triggerEventMatch[i]
      if (tem.id === event.target.id) { this.state.triggerEventMatch.splice(i, 1) }
      i++
    }

    this.setState({triggerEventMatch: this.state.triggerEventMatch}, () => {
      this.updateCampaign()
    })
  }

  updatePendingKey (event) {
    this.setState({pendingKey: event.target.value})
  }

  updatePendingValue (event) {
    this.setState({pendingValue: event.target.value})
  }

  addAttribute () {
    this.state.triggerEventMatch.push({id: this.state.pendingKey, value: this.state.pendingValue})
    this.setState({
      triggerEventMatch: this.state.triggerEventMatch,
      pendingKey: '',
      pendingValue: ''
    }, () => {
      this.updateCampaign()
    })
  }

  render () {
    if (!this.state.campaign) { return null }
    if (this.state.campaign.type !== 'trigger') { return null }

    return (
      <div>
        <Form horizontal>
          <FormGroup>
            <Col md={6}>
              <ControlLabel>Trigger-Send Delay (seconds)</ControlLabel>
            </Col>
            <Col md={6}>
              <FormControl id='triggerDelay' type='number' value={this.state.campaign.triggerDelay || 0} onChange={this.inlinePropChange.bind(this)} />
            </Col>
          </FormGroup>
        </Form>

        <hr />
        <h3>Event Triggers:</h3>

        <LazyTable
          objects={this.state.triggerEventMatch}
          inlineEdit={{value: this.handleEdit.bind(this)}}
          destroy={this.handleDestroy.bind(this)}
        />

        <br />
        <p>Add Attribute:</p>

        <Form onSubmit={this.addAttribute.bind(this)} horizontal>
          <FormGroup>
            <Col componentClass={ControlLabel} md={2}>
              <strong>Key:</strong>
            </Col>
            <Col md={10}>
              <FormControl value={this.state.pendingKey} type='text' placeholder='firstName' onChange={this.updatePendingKey.bind(this)} />
            </Col>
          </FormGroup>

          <FormGroup>
            <Col componentClass={ControlLabel} md={2}>
              <strong>Value:</strong>
            </Col>
            <Col md={10}>
              <FormControl value={this.state.pendingValue} type='text' placeholder='Evan' onChange={this.updatePendingValue.bind(this)} />
            </Col>
          </FormGroup>

          <FormGroup>
            <Col mdOffset={2} md={10}>
              <Button type='submit'>Add Attribute</Button>
            </Col>
          </FormGroup>
        </Form>
      </div>
    )
  }
}
