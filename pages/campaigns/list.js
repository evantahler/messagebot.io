import React from 'react'
import Page from './../../components/layouts/page.js'
import Client from './../../components/utils/client.js'
import Router from 'next/router'
import Moment from 'moment'
import { Row, Col, FormGroup, Button, Panel, Radio } from 'react-bootstrap'
import LazyTable from './../../components/utils/lazyTable.js'
import LazyEditModal from '../../components/utils/lazyEditModal.js'
import PaginationHelper from './../../components/utils/paginationHelper.js'

export default class extends React.Component {
  constructor () {
    super()
    this.state = {
      client: new Client(),
      error: null,
      successMessage: null,
      folders: [],
      campaigns: [],
      lists: [],
      templates: [],
      transports: [],
      types: [],
      perPage: 25,
      total: 0,
      folder: '_all',
      page: 0,
      showNewModal: false,
      showEditModal: false,
      newCampaign: {},
      editCampaign: {}

    }
  }

  updateRoute () {
    Router.push(`/campaigns/list`, `/campaigns/list/${this.state.folder}/${this.state.page}`)
  }

  componentDidMount () {
    this.setState({
      folder: unescape(Router.query.item || this.state.folder),
      page: (Router.query.page || this.state.page)
    }, () => {
      this.loadCampaigns()
      this.loadTemplates()
      this.loadLists()
      this.loadFolders()
      this.loadTypes()
      this.loadTransports()
    })
  }

  loadCampaigns () {
    const client = this.state.client

    let params = {
      from: (this.state.page * this.state.perPage),
      size: this.state.perPage
    }

    if (this.state.folder !== '_all') { params.folder = this.state.folder }

    client.action(params, '/api/campaigns', 'GET', (data) => {
      let campaigns = []
      data.campaigns.forEach(function (campaign) {
        if (campaign.sendAt) { campaign.sendAt = Moment(new Date(Date.parse(campaign.sendAt))).fromNow() }
        campaigns.push(campaign)
      })

      this.setState({
        campaigns: campaigns,
        total: data.total
      }, () => { this.hydrateCampaigns() })
    }, (error) => { this.setState({error}) })
  }

  hydrateCampaigns () {
    let campaigns = this.state.campaigns
    let hydratedCampaigns = []

    campaigns.forEach((campaign) => {
      this.state.lists.forEach((list) => {
        if (list.guid === campaign.listGuid) { campaign.list = list.name }
      })

      this.state.templates.forEach((template) => {
        if (template.guid === campaign.templateGuid) { campaign.template = template.name }
      })

      hydratedCampaigns.push(campaign)
    })

    this.setState({campaigns: hydratedCampaigns})
  }

  loadFolders () {
    const client = this.state.client
    client.action({}, '/api/campaigns/folders', 'GET', (data) => {
      this.setState({folders: data.folders})
    }, (error) => { this.setState({error}) })
  }

  loadTemplates () {
    // TODO: Pagination
    const client = this.state.client

    client.action({}, '/api/templates', 'GET', (data) => {
      this.setState({templates: data.templates}, () => { this.hydrateCampaigns() })
    }, (error) => { this.setState({error}) })
  }

  loadLists () {
    // TODO: Pagination
    const client = this.state.client

    client.action({}, '/api/lists', 'GET', (data) => {
      this.setState({lists: data.lists}, () => { this.hydrateCampaigns() })
    }, (error) => { this.setState({error}) })
  }

  loadTypes () {
    // TODO: Pagination
    const client = this.state.client

    client.action({}, '/api/campaigns/types', 'GET', (data) => {
      this.setState({types: data.validTypes})
    }, (error) => { this.setState({error}) })
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
    }, (error) => { this.setState({error}) })
  }

  editCampaign (event) {
    let campaignGuid = event.target.id

    this.state.campaigns.forEach((campaign) => {
      if (campaign.guid === campaignGuid) {
        this.setState({editCampaign: campaign}, () => {
          this.openEditModal()
        })
      }
    })
  }

  cloneCampaign (event) {
    const client = this.state.client
    let input = prompt('Please enter a name for the new campaign')

    if (input) {
      client.action({
        campaignGuid: event.target.id,
        name: input
      }, '/api/campaign/copy', 'POST', (data) => {
        this.loadCampaigns()
      }, (error) => { this.setState({error}) })
    }
  }

  destroyCampaign (event) {
    let client = this.state.client

    if (confirm('Are you sure?')) {
      client.action({campaignGuid: event.target.id}, '/api/campaign', 'DELETE', (data) => {
        this.setState({successMessage: 'Campaign Deleted'})
        this.loadCampaigns()
        this.loadFolders()
      }, (error) => { this.setState({error}) })
    }
  }

  changeFolder (event) {
    this.setState({folder: event.target.value}, () => {
      this.updateRoute()
      this.loadCampaigns()
    })
  }

  openNewModal () {
    this.setState({ showNewModal: true })
  }

  closeNewModal () {
    this.setState({ showNewModal: false })
  }

  openEditModal () {
    this.setState({ showEditModal: true })
  }

  closeEditModal () {
    this.setState({ showEditModal: false })
  }

  processNewCampaignModal () {
    const client = this.state.client

    client.action(this.state.newCampaign, '/api/campaign', 'POST', (data) => {
      this.setState({newCampaign: {}, successMessage: 'Campaign Created'})
      this.closeNewModal()
      this.loadCampaigns()
      this.loadFolders()
    }, (error) => { this.setState({error}) })
  }

  processEditCampaignModal () {
    const client = this.state.client

    client.action({
      campaignGuid: this.state.editCampaign.guid,
      name: this.state.editCampaign.name,
      description: this.state.editCampaign.description,
      folder: this.state.editCampaign.folder,
      transport: this.state.editCampaign.transport,
      type: this.state.editCampaign.type,
      listGuid: this.state.editCampaign.listGuid,
      templateGuid: this.state.editCampaign.templateGuid
    }, '/api/campaign', 'PUT', (data) => {
      this.setState({editCampaign: {}, successMessage: 'Campaign Updated'})
      this.closeEditModal()
      this.loadCampaigns()
      this.loadFolders()
    }, (error) => { this.setState({error}) })
  }

  updatePage (page) {
    this.setState({page}, () => {
      this.updateRoute()
      this.loadCampaigns()
    })
  }

  render () {
    return (
      <Page loggedIn client={this.state.client} error={this.state.error} successMessage={this.state.successMessage}>
        <h1>Campaigns</h1>

        <Button onClick={this.openNewModal.bind(this)}>Create Campaign</Button>

        <Row>
          <Col md={3}>
            <br />
            <Panel header='Folders'>
              <FormGroup>
                <Radio checked={(this.state.folder === '_all')} value='_all' onChange={this.changeFolder.bind(this)} inline>Show All</Radio>
                <hr />
                {
                  this.state.folders.map((f) => {
                    return (
                      <div key={f}>
                        <Radio checked={(f === this.state.folder)} value={f} onChange={this.changeFolder.bind(this)} key={f} inline>{f}</Radio>
                        <br />
                      </div>
                    )
                  })
                }
              </FormGroup>
            </Panel>
          </Col>

          <Col md={9}>
            <br />
            <LazyTable
              recordType='campaign'
              objects={this.state.campaigns}
              ignoredKeys={[
                'updatedAt',
                'sendingAt',
                'sentAt',
                'listGuid',
                'templateGuid',
                'reSendDelay',
                'campaignVariables',
                'triggerDelay',
                'triggerEventMatch'
              ]}
              edit={this.editCampaign.bind(this)}
              clone={this.cloneCampaign.bind(this)}
              destroy={this.destroyCampaign.bind(this)}
            />

            <PaginationHelper
              currentPage={this.state.page}
              total={this.state.total}
              perPage={this.state.perPage}
              updatePage={this.updatePage.bind(this)}
            />
          </Col>
        </Row>

        <LazyEditModal
          title={'Create Campaign'}
          object={this.state.newCampaign}
          show={this.state.showNewModal}
          onHide={this.closeNewModal.bind(this)}
          onSubmit={this.processNewCampaignModal.bind(this)}
          options={{
            templateGuid: this.state.templates,
            type: this.state.types,
            listGuid: this.state.lists,
            transport: this.state.transports.map((e) => { return e.name })
          }}
          extraKeys={[
            'name',
            'description',
            'folder',
            'transport',
            'type',
            'listGuid',
            'templateGuid'
          ]}
        />

        <LazyEditModal
          title={'Edit Template'}
          object={this.state.editCampaign}
          show={this.state.showEditModal}
          onHide={this.closeEditModal.bind(this)}
          onSubmit={this.processEditCampaignModal.bind(this)}
          options={{
            templateGuid: this.state.templates,
            type: this.state.types,
            listGuid: this.state.lists,
            transport: this.state.transports.map((e) => { return e.name })
          }}
          ignoredKeys={[
            'list',
            'template',
            'campaignVariables',
            'reSendDelay',
            'sendAt',
            'sendingAt',
            'sentAt',
            'triggerDelay',
            'triggerEventMatch'
          ]}
        />
      </Page>
    )
  }
}
