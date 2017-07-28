import React from 'react'
import Page from './../../components/layouts/page.js'
import Client from './../../components/utils/client.js'
import Link from 'next/link'

import LazyEditPanel from '../../components/utils/lazyEditPanel.js'

export default class extends React.Component {
  constructor () {
    super()
    this.state = {
      client: new Client(),
      status: false,
      user: {},
      roles: [],
      error: null
    }
  }

  componentDidMount () {
    this.loadUser()
    this.loadRoles()
  }

  processForm (event) {
    event.preventDefault()
    const client = this.state.client
    client.action(this.state.user, '/api/user', 'PUT', (data) => {
      this.setState({user: data.user, successMessage: 'User Updated'})
    }, (error) => this.setState({error}))
  }

  loadUser () {
    const client = this.state.client
    client.action({}, '/api/user', 'GET', (data) => {
      this.setState({user: data.user})
    }, (error) => this.setState({error}))
  }

  loadRoles () {
    const client = this.state.client
    client.action({}, '/api/users/roles', 'GET', (data) => {
      this.setState({roles: data.roles})
    }, (error) => this.setState({error}))
  }

  render () {
    return (
      <Page loggedIn client={this.state.client} error={this.state.error} successMessage={this.state.successMessage} >
        <h1>Account Settings for {this.state.user.firstName} {this.state.user.lastName}</h1>
        <p><Link href={{pathname: `/person/view`, query: {page: this.state.user.personGuid}}} as={`/person/view/${this.state.user.personGuid}`}><a>View Person {this.state.user.personGuid}</a></Link></p>

        <LazyEditPanel
          title={'Edit User'}
          object={this.state.user}
          onSubmit={this.processForm.bind(this)}
          extraKeys={['password']}
          ignoredKeys={[]}
          types={{
            password: 'password'
          }}
          options={{
            role: this.state.roles
          }}
        />

      </Page>
    )
  }
}
