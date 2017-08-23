import React from 'react'
import Page from './../../components/layouts/page.js'
import { Button } from 'react-bootstrap'
import Client from './../../components/utils/client.js'

import LazyTable from '../../components/utils/lazyTable.js'
import LazyEditModal from '../../components/utils/lazyEditModal.js'

export default class extends React.Component {
  constructor () {
    super()
    this.state = {
      client: new Client(),
      error: null,
      successMessage: null,
      users: [],
      roles: [],
      user: {}, // this will hold the or edditing user in question
      userAddModal: false,
      userEditModal: false
    }
  }

  processUserAddForm (event) {
    event.preventDefault()
    const client = this.state.client
    client.action(this.state.user, '/api/user', 'POST', (data) => {
      this.setState({successMessage: 'User Added'})
      this.hideUserAddModal()
      this.loadUsers()
    }, (error) => this.setState({error}))
  }

  processUserDelete (event) {
    const client = this.state.client
    if (confirm('Are you Sure?')) {
      client.action({userId: event.target.id}, '/api/user', 'DELETE', (data) => {
        this.setState({successMessage: 'User Deleted'})
        this.loadUsers()
      }, (error) => this.setState({error}))
    }
  }

  processUserEditForm (event) {
    event.preventDefault()
    const client = this.state.client
    let user = this.state.user
    user.userId = this.state.user.guid
    client.action(user, '/api/user', 'PUT', (data) => {
      this.setState({successMessage: 'User Updated'})
      this.hideUserEditModal()
      this.loadUsers()
    }, (error) => this.setState({error}))
  }

  componentDidMount () {
    this.loadUsers()
    this.loadRoles()
  }

  showUserAddModal () {
    this.setState({ user: {} })
    this.setState({ userAddModal: true })
  }

  showUserEditModal (event) {
    let user = null
    this.state.users.forEach(function (u) {
      if (u.guid === event.target.id) { user = u }
    })

    this.setState({ userEditModal: true })
    this.setState({ user: user })
  }

  hideUserAddModal () {
    this.setState({ userAddModal: false })
  }

  hideUserEditModal () {
    this.setState({ userEditModal: false })
  }

  loadRoles () {
    const client = this.state.client
    client.action({}, '/api/users/roles', 'GET', (data) => {
      this.setState({roles: data.roles})
    }, (error) => this.setState({error}))
  }

  loadUsers () {
    const client = this.state.client
    client.action({}, '/api/users', 'GET', (data) => {
      this.setState({users: data.users})
    }, (error) => this.setState({error}))
  }

  render () {
    return (
      <Page loggedIn client={this.state.client} error={this.state.error} successMessage={this.state.successMessage} >
        <h1>Users</h1>

        <LazyEditModal
          title={'Add User'}
          object={this.state.user}
          show={this.state.userAddModal}
          onHide={this.hideUserAddModal.bind(this)}
          onSubmit={this.processUserAddForm.bind(this)}
          extraKeys={[
            'email',
            'firstName',
            'lastName',
            'role',
            'password'
          ]}
          ignoredKeys={[]}
          types={{
            password: 'password'
          }}
          options={{
            role: this.state.roles
          }}
        />

        <LazyEditModal
          title={'Edit User'}
          object={this.state.user}
          show={this.state.userEditModal}
          onHide={this.hideUserEditModal.bind(this)}
          onSubmit={this.processUserEditForm.bind(this)}
          extraKeys={['password']}
          ignoredKeys={[]}
          types={{
            password: 'password'
          }}
          options={{
            role: this.state.roles
          }}
        />

        <LazyTable
          objects={this.state.users}
          edit={this.showUserEditModal.bind(this)}
          destroy={this.processUserDelete.bind(this)}
          ignoredKeys={[]}
        />

        <Button bsStyle='primary' onClick={this.showUserAddModal.bind(this)}>Create User</Button>
      </Page>
    )
  }
}
