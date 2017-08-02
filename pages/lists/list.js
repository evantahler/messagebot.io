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
      lists: [],
      folders: [],
      folder: '_all',
      page: 0,
      perPage: 25,
      showNewStaticModal: false,
      showNewDynamicModal: false,
      showEditStaticModal: false,
      showEditDynamicModal: false,
      newType: '',
      newList: {},
      editList: {}
    }
  }

  updateRoute () {
    Router.push(`/lists/list`, `/lists/list/${this.state.folder}/${this.state.page}`)
  }

  componentDidMount () {
    this.setState({
      folder: (Router.query.item || this.state.folder),
      page: (Router.query.page || this.state.page)
    }, () => {
      this.loadLists()
      this.loadFolders()
    })
  }

  loadLists () {
    const client = this.state.client

    let params = {
      from: (this.state.page * this.state.perPage),
      size: this.state.perPage
    }

    if (this.state.folder !== '_all') { params.folder = this.state.folder }

    client.action(params, '/api/lists', 'GET', (data) => {
      let lists = []
      data.lists.forEach((list) => {
        if (list.peopleCountedAt) {
          list.peopleCountedAt = Moment(new Date(Date.parse(list.peopleCountedAt))).calendar()
        }

        if (list.personQuery) { list.personQuery = JSON.stringify(list.personQuery, 0, 2) }
        if (list.eventQuery) { list.eventQuery = JSON.stringify(list.eventQuery, 0, 2) }
        if (list.messageQuery) { list.personQuery = JSON.stringify(list.messageQuery, 0, 2) }

        lists.push(list)
      })

      this.setState({
        lists: lists,
        total: data.total
      })
    }, (error) => { this.setState({error}) })
  }

  editList (event) {
    let listId = parseInt(event.target.id, 10)
    this.state.lists.forEach((list) => {
      if (list.id === listId) {
        this.setState({editList: list}, () => {
          if (list.type === 'static') {
            this.openEditStaticModal()
          } else {
            this.openEditDynamicModal()
          }
        })
      }
    })
  }

  cloneList (event) {
    const client = this.state.client
    let input = prompt('Please enter a name for the new list')

    if (input) {
      client.action({
        listId: event.target.id,
        name: input
      }, '/api/list/copy', 'POST', (data) => {
        this.loadLists()
      }, (error) => { this.setState({error}) })
    }
  }

  destroyList (event) {
    const client = this.state.client

    if (confirm('Are you sure?')) {
      client.action({listId: event.target.id}, '/api/list', 'DELETE', (data) => {
        this.setState({successMessage: 'List Deleted'})
        this.loadLists()
        this.loadFolders()
      }, (error) => { this.setState({error}) })
    }
  }

  loadFolders () {
    const client = this.state.client

    client.action({}, '/api/lists/folders', 'GET', (data) => {
      this.setState({folders: data.folders})
    }, (error) => { this.setState({error}) })
  }

  changeFolder (event) {
    this.setState({folder: event.target.value}, () => {
      this.updateRoute()
      this.loadLists()
    })
  }

  openNewStaticModal () {
    this.setState({ showNewStaticModal: true, newType: 'static' })
  }

  closeNewStaticModal () {
    this.setState({ showNewStaticModal: false })
  }

  openEditStaticModal () {
    this.setState({ showEditStaticModal: true })
  }

  closeEditStaticModal () {
    this.setState({ showEditStaticModal: false })
  }

  openNewDynamicModal () {
    this.setState({ showNewDynamicModal: true, newType: 'dynamic' })
  }

  closeNewDynamicModal () {
    this.setState({ showNewDynamicModal: false })
  }

  openEditDynamicModal () {
    this.setState({ showEditDynamicModal: true })
  }

  closeEditDynamicModal () {
    this.setState({ showEditDynamicModal: false })
  }

  processNewListModal () {
    const client = this.state.client
    let newList = this.state.newList

    newList.type = this.state.newType
    client.action(newList, '/api/list', 'POST', (data) => {
      this.setState({newList: {}, successMessage: 'List Created'})
      this.closeNewStaticModal()
      this.loadLists()
      this.loadFolders()
    }, (error) => { this.setState({error}) })
  }

  processEditListModal () {
    const client = this.state.client
    let editList = this.state.editList

    editList.listId = this.state.editList.id
    client.action(editList, '/api/list', 'PUT', (data) => {
      this.setState({editList: {}, successMessage: 'List Updated'})
      this.closeEditStaticModal()
      this.closeEditDynamicModal()
      this.loadLists()
      this.loadFolders()
    }, (error) => { this.setState({error}) })
  }

  updatePage (page) {
    this.setState({page}, () => {
      this.loadLists()
      this.updateRoute()
    })
  }

  render () {
    return (
      <Page loggedIn client={this.state.client} error={this.state.error} successMessage={this.state.successMessage}>
        <h1>Lists</h1>

        <Button onClick={this.openNewStaticModal.bind(this)}>Create Static List</Button>{' '}
        <Button onClick={this.openNewDynamicModal.bind(this)}>Create Dynamic List</Button>

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
              recordType='list'
              objects={this.state.lists}
              ignoredKeys={[
                'updatedAt',
                'eventQuery',
                'personQuery',
                'messageQuery'
              ]}
              edit={this.editList.bind(this)}
              clone={this.cloneList.bind(this)}
              destroy={this.destroyList.bind(this)}
            />

            <PaginationHelper
              currentPage={this.state.page}
              total={this.state.total}
              perPage={this.state.perPage}
              updatePage={this.updatePage.bind(this)}
            />
          </Col>
        </Row>

        <Row>
          <Col md={12}>
            <hr />
            <p>
              <strong>Notes:</strong>
            </p>

            <ul>
              <li>
                When creating Dynamic Lists, the queries to build them are JSON collections of search keys & values.  This personQuery would match all people with source iPhone: <code>{`{"source": ["iPhone"]}`}</code>
              </li>
              <li>
                Use '!' as the first letter to create searches for things that do not include a set.  This personQuery would match all people with sources other than iPhones: <code>{`{"source": ["!iPhone"]}`}</code>
              </li>
              <li>
                Use '%' for wildcards.  This personQuery would match all people with "E" first names: <code>{`{"firstName": ["e%"]}`}</code>
              </li>
            </ul>
          </Col>
        </Row>

        <LazyEditModal
          title={'Create Static List'}
          object={this.state.newList}
          show={this.state.showNewStaticModal}
          onHide={this.closeNewStaticModal.bind(this)}
          onSubmit={this.processNewListModal.bind(this)}
          extraKeys={[
            'name',
            'description',
            'folder'
          ]}
        />

        <LazyEditModal
          title={'Create Dynamic List'}
          object={this.state.newList}
          show={this.state.showNewDynamicModal}
          onHide={this.closeNewDynamicModal.bind(this)}
          onSubmit={this.processNewListModal.bind(this)}
          types={{
            personQuery: 'textarea',
            eventQuery: 'textarea',
            messageQuery: 'textarea'
          }}
          extraKeys={[
            'name',
            'description',
            'folder',
            'personQuery',
            'eventQuery',
            'messageQuery'
          ]}
        />

        <LazyEditModal
          title={'Edit Static List'}
          object={this.state.editList}
          show={this.state.showEditStaticModal}
          onHide={this.closeEditStaticModal.bind(this)}
          onSubmit={this.processEditListModal.bind(this)}
          ignoredKeys={[
            'eventQuery',
            'personQuery',
            'messageQuery',
            'peopleCount',
            'peopleCountedAt',
            'type'
          ]}
        />

        <LazyEditModal
          title={'Edit Dynamic List'}
          object={this.state.editList}
          show={this.state.showEditDynamicModal}
          onHide={this.closeEditDynamicModal.bind(this)}
          onSubmit={this.processEditListModal.bind(this)}
          types={{
            personQuery: 'textarea',
            eventQuery: 'textarea',
            messageQuery: 'textarea'
          }}
          ignoredKeys={[
            'peopleCount',
            'peopleCountedAt',
            'type'
          ]}
        />
      </Page>
    )
  }
}
