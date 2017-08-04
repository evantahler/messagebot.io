import React from 'react'
import Page from './../../components/layouts/page.js'
import Client from './../../components/utils/client.js'
import Router from 'next/router'
import { Row, Col, Button } from 'react-bootstrap'
import LazyTable from './../../components/utils/lazyTable.js'
import LazyEditModal from './../../components/utils/lazyEditModal.js'
import PaginationHelper from './../../components/utils/paginationHelper.js'

export default class extends React.Component {
  constructor () {
    super()
    this.state = {
      client: new Client(),
      error: null,
      successMessage: null,
      perPage: 25,
      total: 0,
      listId: 0,
      list: [],
      people: [],
      page: 0,
      showUploadGuidModal: false,
      showUploadFileModal: false,
      personGuidContainer: {}
    }
  }

  componentDidMount () {
    let page = Router.query.page
    let listId = Router.query.item
    if (!listId && page) { listId = page; page = 0 }

    this.setState({ listId: listId, page: page }, () => {
      this.loadList()
      this.loadListPeople()
    })
  }

  updateRoute () {
    Router.push(`/list/view`, `/list/view/${this.state.listId}/${this.state.page}`)
  }

  openUploadGuidModal () {
    this.setState({ showUploadGuidModal: true })
  }

  closeUploadGuidModal () {
    this.setState({ showUploadGuidModal: false })
  }

  openUploadFileModal () {
    this.setState({ showUploadFileModal: true })
  }

  closeUploadFileModal () {
    this.setState({ showUploadFileModal: false })
  }

  loadList () {
    const client = this.state.client

    client.action({listId: this.state.listId}, '/api/list', 'GET', (data) => {
      this.setState({list: data.list})
    }, (error) => { this.setState({error}) })
  }

  loadListPeople () {
    const client = this.state.client

    let params = {
      listId: this.state.listId,
      from: (this.state.page * this.state.perPage),
      size: this.state.perPage
    }

    client.action(params, '/api/list/people', 'GET', (data) => {
      this.setState({ total: data.total, people: data.people })
    }, (error) => { this.setState({error}) })
  }

  processGuidModalUpload () {
    const client = this.state.client

    let paylaod = {
      personGuids: this.state.personGuidContainer.personGuids,
      listId: this.state.listId
    }

    client.action(paylaod, '/api/list/people', 'PUT', (data) => {
      this.setState({personGuidContainer: {}, successMessage: `${data.personGuids.length} People Added`})
      this.closeUploadGuidModal()
      this.loadListPeople()
    }, (error) => { this.setState({error}) })
  }

  processFileModalUpload () {
    const client = this.state.client
    const file = this.state.personGuidContainer._files[0]

    client.action({
      listId: this.state.listId,
      file: file
    }, '/api/list/people', 'PUT', (data) => {
      this.setState({personGuidContainer: {}, successMessage: `${data.personGuids.length} People Added`})
      this.closeUploadFileModal()
      this.loadListPeople()
    }, (error) => { this.setState({error}) })
  }

  removePersonBuilder () {
    const self = this
    const client = this.state.client

    if (this.state.list && this.state.list.type === 'static') {
      return function (event) {
        if (confirm('Are you sure?')) {
          client.action({
            listId: self.state.listId,
            personGuids: event.target.id
          }, '/api/list/people', 'DELETE', (data) => {
            self.setState({successMessage: 'Person removed from list'})
            self.loadListPeople()
          }, (error) => { self.setState({error}) })
        }
      }
    } else {
      return null
    }
  }

  updatePage (page) {
    this.setState({page}, () => {
      this.loadListPeople()
      this.updateRoute()
    })
  }

  render () {
    return (
      <Page loggedIn client={this.state.client} error={this.state.error} successMessage={this.state.successMessage}>
        <h1>People in <strong>{ this.state.list.name }</strong> ({ this.state.total } total)</h1>

        {
          (() => {
            if (this.state.list && this.state.list.type === 'static') {
              return (
                <Row>
                  <Col md={12}>
                    <Button onClick={this.openUploadGuidModal.bind(this)}>Add List People via personGuid</Button>{' '}
                    <Button onClick={this.openUploadFileModal.bind(this)}>Add List People via file</Button>
                    <br />
                    <br />
                  </Col>
                </Row>
              )
            } else {
              return null
            }
          })()
        }

        <LazyTable
          recordType='person'
          objects={this.state.people}
          ignoredKeys={[]}
          destroy={this.removePersonBuilder()}
        />

        <PaginationHelper
          currentPage={this.state.page}
          total={this.state.total}
          perPage={this.state.perPage}
          updatePage={this.updatePage.bind(this)}
        />

        <LazyEditModal
          title={'Add List People via personGuid'}
          description='Person Guids (seperate by commas)'
          object={this.state.personGuidContainer}
          show={this.state.showUploadGuidModal}
          onHide={this.closeUploadGuidModal.bind(this)}
          onSubmit={this.processGuidModalUpload.bind(this)}
          extraKeys={['personGuids']}
          types={{ personGuids: 'textarea' }}
        />

        <LazyEditModal
          title={'Add List People via File Upload'}
          description={
            <div>
              <p>File uploads should be .csv files with the first line containing header information.  guids are optional.</p>
              <pre>
                guid, firstName, lastName, email {`\r\n`}
                000001, Evan, Tahler, evan.tahler@gmail.com {`\r\n`}
                000002, Christina, Hussain, christina.hussain@gmail.com {`\r\n`}
                000003, Andy, Jih, andy.jih@gmail.com {`\r\n`}
                000004, Heather, Tahler, heather.tahler@gmail.com {`\r\n`}
              </pre>
            </div>
          }
          object={this.state.personGuidContainer}
          show={this.state.showUploadFileModal}
          onHide={this.closeUploadFileModal.bind(this)}
          onSubmit={this.processFileModalUpload.bind(this)}
          extraKeys={['file']}
          types={{ file: 'file' }}
        />
      </Page>
    )
  }
}
