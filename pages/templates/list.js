import React from 'react'
import Page from './../../components/layouts/page.js'
import Client from './../../components/utils/client.js'
import Router from 'next/router'
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
      templates: [],
      folders: [],
      perPage: 25,
      total: 0,
      folder: '_all',
      page: 0,
      showNewModal: false,
      showEditModal: false,
      newTemplate: {},
      editTemplate: {}
    }
  }

  updateRoute () {
    Router.push(`/templates/list`, `/templates/list/${this.state.folder}/${this.state.page}`)
  }

  componentDidMount () {
    this.setState({
      folder: unescape(Router.query.item || this.state.folder),
      page: (Router.query.page || this.state.page)
    }, () => {
      this.loadTemplates()
      this.loadFolders()
    })
  }

  loadTemplates () {
    const client = this.state.client

    let params = {
      from: (this.state.page * this.state.perPage),
      size: this.state.perPage
    }

    if (this.state.folder !== '_all') { params.folder = this.state.folder }

    client.action(params, '/api/templates', 'GET', (data) => {
      this.setState({
        templates: data.templates,
        total: data.total
      })
    }, (error) => { this.setState({error}) })
  }

  editTemplate (event) {
    let templateGuid = event.target.id
    this.state.templates.forEach((template) => {
      if (template.guid === templateGuid) {
        this.setState({editTemplate: template}, () => {
          this.openEditModal()
        })
      }
    })
  }

  cloneTemplate (event) {
    const client = this.state.client
    let input = prompt('Please enter a name for the new template')

    if (input) {
      client.action({
        templateGuid: event.target.id,
        name: input
      }, '/api/template/copy', 'POST', (data) => {
        this.loadTemplates()
      }, (error) => { this.setState({error}) })
    }
  }

  destroyTemplate (event) {
    let client = this.state.client

    if (confirm('Are you sure?')) {
      client.action({templateGuid: event.target.id}, '/api/template', 'DELETE', (data) => {
        this.setState({successMessage: 'Template Deleted'})
        this.loadTemplates()
        this.loadFolders()
      }, (error) => { this.setState({error}) })
    }
  }

  loadFolders () {
    const client = this.state.client
    client.action({}, '/api/templates/folders', 'GET', (data) => {
      this.setState({folders: data.folders})
    }, (error) => { this.setState({error}) })
  }

  changeFolder (event) {
    this.setState({folder: event.target.value, page: 0}, () => {
      this.updateRoute()
      this.loadTemplates()
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

  processNewTemplateModal () {
    const client = this.state.client

    client.action(this.state.newTemplate, '/api/template', 'POST', (data) => {
      this.setState({newTemplate: {}, successMessage: 'Template Created'})
      this.closeNewModal()
      this.loadTemplates()
      this.loadFolders()
    }, (error) => { this.setState({error}) })
  }

  processEditTemplateModal () {
    const client = this.state.client
    let editTemplate = this.state.editTemplate
    editTemplate.templateGuid = this.state.editTemplate.guid

    client.action(editTemplate, '/api/template', 'PUT', (data) => {
      this.setState({editTemplate: {}, successMessage: 'Template Updated'})
      this.closeEditModal()
      this.loadTemplates()
      this.loadFolders()
    }, (error) => { this.setState({error}) })
  }

  updatePage (page) {
    this.setState({page}, () => {
      this.loadTemplates()
      this.updateRoute()
    })
  }

  render () {
    return (
      <Page loggedIn client={this.state.client} error={this.state.error} successMessage={this.state.successMessage}>
        <h1>Templates</h1>

        <Button onClick={this.openNewModal.bind(this)}>Create Template</Button>

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
              recordType='template'
              objects={this.state.templates}
              ignoredKeys={[
                'updatedAt',
                'template'
              ]}
              edit={this.editTemplate.bind(this)}
              clone={this.cloneTemplate.bind(this)}
              destroy={this.destroyTemplate.bind(this)}
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
          title={'Create Template'}
          object={this.state.newTemplate}
          show={this.state.showNewModal}
          onHide={this.closeNewModal.bind(this)}
          onSubmit={this.processNewTemplateModal.bind(this)}
          extraKeys={[
            'name',
            'description',
            'folder'
          ]}
        />

        <LazyEditModal
          title={'Edit Template'}
          object={this.state.editTemplate}
          show={this.state.showEditModal}
          onHide={this.closeEditModal.bind(this)}
          onSubmit={this.processEditTemplateModal.bind(this)}
          ignoredKeys={[
            'template'
          ]}
        />

      </Page>
    )
  }
}
